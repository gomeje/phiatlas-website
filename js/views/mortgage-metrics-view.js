/**
 * Mortgage Metrics View
 * Strictly consumes calculated model output and updates DOM elements.
 */
import { formatCurrency, formatDuration } from '../utils/formatters.js';

export class MortgageMetricsView {
  constructor() {
    this.basePaymentEl = document.getElementById('kpi-base-payment');
    this.totalPaymentEl = document.getElementById('kpi-total-payment');
    this.interestSavedEl = document.getElementById('kpi-interest-saved');
    this.timeSavedEl = document.getElementById('kpi-time-saved');
    this.baselineTotalInterestEl = document.getElementById('kpi-baseline-interest');
    this.acceleratedTotalInterestEl = document.getElementById('kpi-accelerated-interest');
  }

  render(modelResult) {
    const { baseline, accelerated, delta } = modelResult;

    if (this.basePaymentEl) {
      this.basePaymentEl.textContent = formatCurrency(baseline.monthlyPayment);
    }
    if (this.totalPaymentEl) {
      this.totalPaymentEl.textContent = formatCurrency(accelerated.monthlyPayment);
    }
    if (this.interestSavedEl) {
      this.interestSavedEl.textContent = formatCurrency(delta.interestSaved);
    }
    if (this.timeSavedEl) {
      this.timeSavedEl.textContent = formatDuration(delta.monthsSaved);
    }
    if (this.baselineTotalInterestEl) {
      this.baselineTotalInterestEl.textContent = formatCurrency(baseline.totalInterest);
    }
    if (this.acceleratedTotalInterestEl) {
      this.acceleratedTotalInterestEl.textContent = formatCurrency(accelerated.totalInterest);
    }
  }
}