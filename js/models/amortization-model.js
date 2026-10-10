/**
 * Headless Amortization & Acceleration Model
 */

export function calculateMonthlyPayment(principal, annualRate, termYears) {
  const p = Number(principal);
  const y = Number(termYears);
  const r = Number(annualRate);

  if (p <= 0 || y <= 0) return 0;

  const monthlyRate = (r / 100) / 12;
  const totalMonths = y * 12;

  if (monthlyRate === 0) {
    return p / totalMonths;
  }

  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return p * (monthlyRate * factor) / (factor - 1);
}

export function generateSchedule({
  principal,
  annualRate,
  termYears,
  extraMonthly = 0,
  lumpSumAmount = 0,
  lumpSumMonth = 0
}) {
  const p = Number(principal);
  const r = Number(annualRate);
  const y = Number(termYears);
  const baseMonthlyPayment = calculateMonthlyPayment(p, r, y);
  const monthlyRate = (r / 100) / 12;
  const maxMonths = y * 12;

  let balance = p;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  const rows = [];

  for (let month = 1; month <= maxMonths && balance > 0.001; month++) {
    const interest = balance * monthlyRate;
    let scheduledPrincipal = baseMonthlyPayment - interest;

    if (scheduledPrincipal > balance) {
      scheduledPrincipal = balance;
    }

    let extra = extraMonthly > 0 ? extraMonthly : 0;
    if (lumpSumMonth === month && lumpSumAmount > 0) {
      extra += lumpSumAmount;
    }

    const remainingAfterScheduled = balance - scheduledPrincipal;
    if (extra > remainingAfterScheduled) {
      extra = remainingAfterScheduled;
    }

    const totalPrincipal = scheduledPrincipal + extra;
    const totalPayment = scheduledPrincipal + interest + extra;

    balance -= totalPrincipal;
    if (balance < 0.005) balance = 0;

    totalInterestPaid += interest;
    totalPrincipalPaid += totalPrincipal;

    rows.push({
      month,
      scheduledPayment: baseMonthlyPayment,
      interest,
      principal: scheduledPrincipal,
      extra,
      totalPayment,
      remainingBalance: balance,
      cumulativeInterest: totalInterestPaid,
      cumulativePrincipal: totalPrincipalPaid
    });

    if (balance === 0) break;
  }

  return {
    monthlyPayment: baseMonthlyPayment,
    payoffMonths: rows.length,
    payoffYears: rows.length / 12,
    totalInterest: totalInterestPaid,
    totalPaid: totalPrincipalPaid + totalInterestPaid,
    schedule: rows
  };
}

export function computeComparativeModel({
  propertyPrice,
  downPaymentPercent,
  annualRate,
  termYears,
  extraMonthly = 0,
  lumpSumAmount = 0,
  lumpSumMonth = 0
}) {
  const price = Number(propertyPrice) || 0;
  const downPct = Number(downPaymentPercent) || 0;
  const rate = Number(annualRate) || 0;
  const term = Number(termYears) || 30;
  const extra = Number(extraMonthly) || 0;
  const lumpAmt = Number(lumpSumAmount) || 0;
  const lumpM = Number(lumpSumMonth) || 0;

  const downPaymentAmount = price * (downPct / 100);
  const loanPrincipal = Math.max(0, price - downPaymentAmount);

  const baseline = generateSchedule({
    principal: loanPrincipal,
    annualRate: rate,
    termYears: term,
    extraMonthly: 0,
    lumpSumAmount: 0,
    lumpSumMonth: 0
  });

  const accelerated = generateSchedule({
    principal: loanPrincipal,
    annualRate: rate,
    termYears: term,
    extraMonthly: extra,
    lumpSumAmount: lumpAmt,
    lumpSumMonth: lumpM
  });

  const interestSaved = Math.max(0, baseline.totalInterest - accelerated.totalInterest);
  const monthsSaved = Math.max(0, baseline.payoffMonths - accelerated.payoffMonths);

  return {
    financing: {
      propertyPrice: price,
      downPaymentAmount,
      loanPrincipal,
      annualRate: rate,
      termYears: term
    },
    baseline: {
      monthlyPayment: baseline.monthlyPayment,
      payoffMonths: baseline.payoffMonths,
      totalInterest: baseline.totalInterest,
      totalOutlay: baseline.totalPaid,
      schedule: baseline.schedule
    },
    accelerated: {
      monthlyPayment: baseline.monthlyPayment + extra,
      payoffMonths: accelerated.payoffMonths,
      totalInterest: accelerated.totalInterest,
      totalOutlay: accelerated.totalPaid,
      schedule: accelerated.schedule
    },
    delta: {
      interestSaved,
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1)
    }
  };
}