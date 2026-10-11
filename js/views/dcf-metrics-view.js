/**
 * DCF Metrics View
 * Maps investment performance calculations to the DOM.
 */
import { formatCurrency, formatPercent } from '../utils/formatters.js';

export class DCFMetricsView {
  constructor() {
    this.dispGoingInCap = document.getElementById('dispGoingInCap');
    this.dispYear1Noi = document.getElementById('dispYear1Noi');
    this.dispUnleveredIrr = document.getElementById('dispUnleveredIrr');
    this.dispLeveredIrr = document.getElementById('dispLeveredIrr');
    this.dispEquityMultiple = document.getElementById('dispEquityMultiple');
    this.dispCashOnCash = document.getElementById('dispCashOnCash');

    this.summaryInitialEquity = document.getElementById('summaryInitialEquity');
    this.summaryDebt = document.getElementById('summaryDebt');
    this.summaryGrossExit = document.getElementById('summaryGrossExit');
    this.summaryNetEquityExit = document.getElementById('summaryNetEquityExit');
    this.proFormaPeriodLabel = document.getElementById('proFormaPeriodLabel');
  }

  render(model) {
    if (!model) return;
    const { financing, exit, metrics, holdYears } = model;

    if (this.dispGoingInCap) this.dispGoingInCap.textContent = formatPercent(metrics.goingInCapRate);
    if (this.dispYear1Noi) this.dispYear1Noi.textContent = formatCurrency(metrics.year1Noi);
    if (this.dispUnleveredIrr) this.dispUnleveredIrr.textContent = formatPercent(metrics.unleveredIRR);
    if (this.dispLeveredIrr) this.dispLeveredIrr.textContent = formatPercent(metrics.leveredIRR);
    if (this.dispEquityMultiple) this.dispEquityMultiple.textContent = `${metrics.equityMultiple.toFixed(2)}x`;
    if (this.dispCashOnCash) this.dispCashOnCash.textContent = formatPercent(metrics.year1CashOnCash);

    if (this.summaryInitialEquity) this.summaryInitialEquity.textContent = formatCurrency(financing.initialEquity);
    if (this.summaryDebt) this.summaryDebt.textContent = formatCurrency(financing.loanAmount);
    if (this.summaryGrossExit) this.summaryGrossExit.textContent = formatCurrency(exit.grossExitPrice);
    if (this.summaryNetEquityExit) this.summaryNetEquityExit.textContent = formatCurrency(exit.netEquityAtExit);

    if (this.proFormaPeriodLabel) this.proFormaPeriodLabel.textContent = `Holding Period: ${holdYears} Years`;
  }
}