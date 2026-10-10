/**
 * Mortgage Advisory Controller
 * Connects /tools/mortgage-amortization/ HTML elements to Models and Views.
 */
import { computeComparativeModel } from '../models/amortization-model.js';
import { MortgageMetricsView } from '../views/mortgage-metrics-view.js';
import { AmortizationChartView } from '../views/amortization-chart-view.js';
import { AmortizationTableView } from '../views/amortization-table-view.js';
import { exportScheduleToCSV } from '../utils/csv-exporter.js';

class MortgageController {
  constructor() {
    // Form Inputs matching exact HTML IDs
    this.inputs = {
      price: document.getElementById('homePrice'),
      downPayment: document.getElementById('downPaymentPercent'),
      rate: document.getElementById('interestRate'),
      term: document.getElementById('loanTermYears'),
      extraMonthly: document.getElementById('extraMonthly'),
      lumpSum: document.getElementById('lumpSumAmount'),
      lumpMonth: document.getElementById('lumpSumMonth')
    };

    // Chart mode toggle buttons
    this.btnViewBalance = document.getElementById('btnViewBalance');
    this.btnViewCapVsInt = document.getElementById('btnViewCapVsInt');
    this.chartSubtitle = document.getElementById('chartViewSubtitle');
    this.currentChartView = 'balance'; // 'balance' | 'capitalVsInterest'

    // Export button
    this.exportBtn = document.getElementById('btnExportCsv');

    // Instantiate Views
    this.metricsView = new MortgageMetricsView();
    this.chartView = new AmortizationChartView(document.getElementById('amortizationCanvas'));
    this.tableView = new AmortizationTableView(document.getElementById('scheduleBody'));

    this.currentModelResult = null;

    this.init();
  }

  init() {
    // 1. Listen for input changes
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.update());
        input.addEventListener('change', () => this.update());
      }
    });

    // 2. Chart view toggle listeners
    if (this.btnViewBalance) {
      this.btnViewBalance.addEventListener('click', () => this.setChartView('balance'));
    }
    if (this.btnViewCapVsInt) {
      this.btnViewCapVsInt.addEventListener('click', () => this.setChartView('capitalVsInterest'));
    }

    // 3. CSV export listener
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        if (this.currentModelResult?.accelerated?.schedule) {
          exportScheduleToCSV(this.currentModelResult.accelerated.schedule);
        }
      });
    }

    // 4. Handle canvas resizing on window resize
    window.addEventListener('resize', () => {
      if (this.currentModelResult) {
        this.renderChart();
      }
    });

    // Initial calculation run
    this.update();
  }

  setChartView(viewName) {
    this.currentChartView = viewName;
    if (this.btnViewBalance) {
      this.btnViewBalance.classList.toggle('active', viewName === 'balance');
    }
    if (this.btnViewCapVsInt) {
      this.btnViewCapVsInt.classList.toggle('active', viewName === 'capitalVsInterest');
    }
    if (this.chartSubtitle) {
      this.chartSubtitle.textContent = viewName === 'balance'
        ? 'Principal Balance Amortization Trajectory'
        : 'Cumulative Capital Built vs. Cumulative Interest Paid';
    }
    this.renderChart();
  }

  getValues() {
    return {
      propertyPrice: parseFloat(this.inputs.price?.value) || 0,
      downPaymentPercent: parseFloat(this.inputs.downPayment?.value) || 0,
      annualRate: parseFloat(this.inputs.rate?.value) || 0,
      termYears: parseInt(this.inputs.term?.value, 10) || 30,
      extraMonthly: parseFloat(this.inputs.extraMonthly?.value) || 0,
      lumpSumAmount: parseFloat(this.inputs.lumpSum?.value) || 0,
      lumpSumMonth: parseInt(this.inputs.lumpMonth?.value, 10) || 0
    };
  }

  renderChart() {
    if (!this.currentModelResult) return;
    this.chartView.render(
      this.currentModelResult.baseline.schedule,
      this.currentModelResult.accelerated.schedule,
      this.currentChartView,
      this.currentModelResult.financing.loanPrincipal
    );
  }

  update() {
    const rawValues = this.getValues();
    this.currentModelResult = computeComparativeModel(rawValues);

    this.metricsView.render(this.currentModelResult);
    this.renderChart();
    this.tableView.render(this.currentModelResult.accelerated.schedule);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MortgageController();
});