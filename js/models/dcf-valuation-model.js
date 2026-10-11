/**
 * Headless Commercial Real Estate DCF & Valuation Model
 * Pure functions: calculates Unlevered (FCFF) and Levered (FCFE) cash flows,
 * Exit Cap Rate residual values, and financial returns (IRR, NPV, MOIC).
 */

/**
 * Standard Newton-Raphson approximation for Internal Rate of Return (IRR)
 */
export function calculateIRR(cashFlows, guess = 0.1) {
  const maxIterations = 100;
  const precision = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(npv) < precision) return rate * 100;
    if (Math.abs(dNpv) < precision) break;

    const nextRate = rate - npv / dNpv;
    if (!Number.isFinite(nextRate)) break;
    rate = nextRate;
  }

  return 0; // Fallback if IRR does not converge
}

/**
 * Net Present Value calculation
 */
export function calculateNPV(discountRatePercent, cashFlows) {
  const r = discountRatePercent / 100;
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);
}

/**
 * Executes full DCF pro forma analysis (Unlevered vs Levered)
 */
export function computeDCFValuation({
  purchasePrice,
  potentialGrossIncome,
  annualRentGrowth = 3.0,
  vacancyRatePercent = 5.0,
  operatingExpenseRatio = 40.0,
  annualExpenseGrowth = 2.5,
  capitalReservesAnnual = 5000,
  holdPeriodYears = 5,
  exitCapRate = 6.5,
  costOfSalePercent = 2.0,
  unleveredDiscountRate = 8.0,
  // Financing Parameters
  ltvPercent = 70.0,
  mortgageRate = 6.5,
  mortgageTermYears = 30,
  leveredDiscountRate = 12.0
}) {
  const price = Number(purchasePrice) || 0;
  const holdYears = parseInt(holdPeriodYears, 10) || 5;

  // 1. Debt Sizing
  const loanAmount = price * (ltvPercent / 100);
  const initialEquity = price - loanAmount;

  // Monthly Debt Service calculation
  const monthlyRate = (mortgageRate / 100) / 12;
  const totalMonths = mortgageTermYears * 12;
  const monthlyPayment = monthlyRate > 0 
    ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : (loanAmount / totalMonths);
  const annualDebtService = monthlyPayment * 12;

  // Calculate remaining loan balance at exit year
  let balance = loanAmount;
  const exitMonths = holdYears * 12;
  for (let m = 1; m <= exitMonths; m++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);
  }
  const loanBalanceAtExit = balance;

  // 2. Multi-Year Operating Pro Forma
  const years = [];
  let currentPGI = potentialGrossIncome;
  let currentOpExRate = operatingExpenseRatio;

  // Run through holdYears + 1 (Year N+1 forward NOI is needed for terminal value)
  for (let y = 1; y <= holdYears + 1; y++) {
    const pgi = y === 1 ? currentPGI : currentPGI * Math.pow(1 + annualRentGrowth / 100, y - 1);
    const vacancyLoss = pgi * (vacancyRatePercent / 100);
    const egi = pgi - vacancyLoss;
    const opex = egi * (currentOpExRate / 100);
    const noi = egi - opex;

    // UFCF = NOI - Capital Reserves & TI/LC
    const ufcf = noi - capitalReservesAnnual;

    // LFCF = UFCF - Annual Debt Service
    const lfcf = ufcf - annualDebtService;

    years.push({
      year: y,
      pgi,
      vacancyLoss,
      egi,
      opex,
      noi,
      capitalReserves: capitalReservesAnnual,
      ufcf,
      debtService: annualDebtService,
      lfcf
    });
  }

  // 3. Terminal Value / Exit Disposition
  const forwardNOI = years[holdYears].noi; // Year N+1 NOI
  const grossExitPrice = forwardNOI / (exitCapRate / 100);
  const netExitProceeds = grossExitPrice * (1 - costOfSalePercent / 100);
  const netEquityAtExit = netExitProceeds - loanBalanceAtExit;

  // 4. Unlevered Cash Flow Stream (FCFF)
  // Year 0 = -Total Asset Price; Years 1 to N-1 = UFCF; Year N = UFCF + Net Exit
  const unleveredCashFlows = [-price];
  for (let y = 0; y < holdYears; y++) {
    if (y === holdYears - 1) {
      unleveredCashFlows.push(years[y].ufcf + netExitProceeds);
    } else {
      unleveredCashFlows.push(years[y].ufcf);
    }
  }

  // 5. Levered Cash Flow Stream (FCFE)
  // Year 0 = -Initial Equity; Years 1 to N-1 = LFCF; Year N = LFCF + Net Equity Exit
  const leveredCashFlows = [-initialEquity];
  for (let y = 0; y < holdYears; y++) {
    if (y === holdYears - 1) {
      leveredCashFlows.push(years[y].lfcf + netEquityAtExit);
    } else {
      leveredCashFlows.push(years[y].lfcf);
    }
  }

  // 6. Return Metrics
  const goingInCapRate = price > 0 ? (years[0].noi / price) * 100 : 0;
  const grossAssetValue = calculateNPV(unleveredDiscountRate, unleveredCashFlows.slice(1));
  const unleveredIRR = calculateIRR(unleveredCashFlows);

  const equityNPV = calculateNPV(leveredDiscountRate, leveredCashFlows);
  const leveredIRR = calculateIRR(leveredCashFlows);
  
  const totalEquityDistributions = leveredCashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
  const equityMultiple = initialEquity > 0 ? (totalEquityDistributions / initialEquity) : 0;
  const year1CashOnCash = initialEquity > 0 ? (years[0].lfcf / initialEquity) * 100 : 0;

  return {
    financing: {
      price,
      loanAmount,
      initialEquity,
      annualDebtService,
      loanBalanceAtExit
    },
    exit: {
      forwardNOI,
      grossExitPrice,
      netExitProceeds,
      netEquityAtExit
    },
 metrics: {
      goingInCapRate,
      grossAssetValue,
      unleveredIRR,
      equityNPV,
      leveredIRR,
      equityMultiple,
      year1CashOnCash,
      year1Noi: years[0].noi
    },
    proForma: years.slice(0, holdYears),
    unleveredCashFlows,
    leveredCashFlows
  };
}