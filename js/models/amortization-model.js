/**
 * Headless Amortization & Acceleration Model
 * Pure calculations with zero DOM or window dependencies.
 */

export function calculateMonthlyPayment(principal, annualRate, termYears) {
  if (principal <= 0 || termYears <= 0) return 0;

  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = termYears * 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return principal * (monthlyRate * factor) / (factor - 1);
}

export function generateSchedule({
  principal,
  annualRate,
  termYears,
  extraMonthly = 0,
  lumpSumAmount = 0,
  lumpSumMonth = 0
}) {
  const baseMonthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  const monthlyRate = (annualRate / 100) / 12;
  const maxMonths = termYears * 12;

  let balance = principal;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  const rows = [];

  for (let month = 1; month <= maxMonths && balance > 0; month++) {
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
      cumulativeInterest: totalInterestPaid
    });

    if (balance === 0) break;
  }

  return {
    baseMonthlyPayment,
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
  const downPaymentAmount = propertyPrice * (downPaymentPercent / 100);
  const loanPrincipal = Math.max(0, propertyPrice - downPaymentAmount);

  const baseline = generateSchedule({
    principal: loanPrincipal,
    annualRate,
    termYears,
    extraMonthly: 0,
    lumpSumAmount: 0,
    lumpSumMonth: 0
  });

  const accelerated = generateSchedule({
    principal: loanPrincipal,
    annualRate,
    termYears,
    extraMonthly,
    lumpSumAmount,
    lumpSumMonth
  });

  const interestSaved = Math.max(0, baseline.totalInterest - accelerated.totalInterest);
  const monthsSaved = Math.max(0, baseline.payoffMonths - accelerated.payoffMonths);

  return {
    financing: {
      propertyPrice,
      downPaymentAmount,
      loanPrincipal,
      annualRate,
      termYears
    },
    baseline: {
      monthlyPayment: baseline.baseMonthlyPayment,
      payoffMonths: baseline.payoffMonths,
      totalInterest: baseline.totalInterest,
      totalOutlay: baseline.totalPaid,
      schedule: baseline.schedule
    },
    accelerated: {
      monthlyPayment: baseline.baseMonthlyPayment + extraMonthly,
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