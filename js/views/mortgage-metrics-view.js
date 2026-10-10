/**
 * Mortgage Metrics View
 */
import { formatCurrency, formatPercent, formatDuration } from '../utils/formatters.js';

export class MortgageMetricsView {
  constructor() {
    this.dispBaseMonthly = document.getElementById('dispBaseMonthly');
    this.dispTotalMonthly = document.getElementById('dispTotalMonthly');
    this.dispBaseTerm = document.getElementById('dispBaseTerm');
    this.dispAccelTerm = document.getElementById('dispAccelTerm');
    this.dispBaseInterest = document.getElementById('dispBaseInterest');
    this.dispSavedInterest = document.getElementById('dispSavedInterest');

    this.summaryPrincipal = document.getElementById('summaryPrincipal');
    this.summaryInterest = document.getElementById('summaryInterest');
    this.summaryTotalPaid = document.getElementById('summaryTotalPaid');
    this.summaryCostRatio = document.getElementById('summaryCostRatio');

    this.scheduleCount = document.getElementById('scheduleCount');
  }

  render(modelResult) {
    if (!modelResult) return;
    const { financing, baseline, accelerated, delta } = modelResult;

    // Top KPI Cards
    if (this.dispBaseMonthly) {
      this.dispBaseMonthly.textContent = formatCurrency(baseline.monthlyPayment);
    }
    if (this.dispTotalMonthly) {
      this.dispTotalMonthly.textContent = formatCurrency(accelerated.monthlyPayment);
    }
    if (this.dispBaseTerm) {
      this.dispBaseTerm.textContent = `${financing.termYears} Yrs`;
    }
    if (this.dispAccelTerm) {
      this.dispAccelTerm.textContent = formatDuration(accelerated.payoffMonths);
    }
    if (this.dispBaseInterest) {
      this.dispBaseInterest.textContent = formatCurrency(baseline.totalInterest);
    }
    if (this.dispSavedInterest) {
      this.dispSavedInterest.textContent = formatCurrency(delta.interestSaved);
    }

    // Capital vs Interest Summary Strip
    if (this.summaryPrincipal) {
      this.summaryPrincipal.textContent = formatCurrency(financing.loanPrincipal);
    }
    if (this.summaryInterest) {
      this.summaryInterest.textContent = formatCurrency(accelerated.totalInterest);
    }
    if (this.summaryTotalPaid) {
      this.summaryTotalPaid.textContent = formatCurrency(accelerated.totalOutlay);
    }
    if (this.summaryCostRatio) {
      const ratio = financing.loanPrincipal > 0
        ? (accelerated.totalInterest / financing.loanPrincipal) * 100
        : 0;
      this.summaryCostRatio.textContent = formatPercent(ratio);
    }

    // Table Footer count
    if (this.scheduleCount) {
      this.scheduleCount.textContent = `Total Payments: ${accelerated.schedule.length}`;
    }
  }
}