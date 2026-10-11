/**
 * Commercial DCF Advisory Controller
 * Entry point for /tools/property-valuation/
 */
import { computeDCFValuation } from '../models/dcf-valuation-model.js';
import { DCFMetricsView } from '../views/dcf-metrics-view.js';
import { DCFChartView } from '../views/dcf-chart-view.js';
import { DCFProFormaTableView } from '../views/dcf-proforma-table-view.js';
import { exportDCFToCSV } from '../utils/dcf-csv-exporter.js';

class DCFController {
  constructor() {
    this.inputs = {
      purchasePrice: document.getElementById('purchasePrice'),
      potentialGrossIncome: document.getElementById('potentialGrossIncome'),
      vacancyRate: document.getElementById('vacancyRate'),
      opexRatio: document.getElementById('opexRatio'),
      capitalReserves: document.getElementById('capitalReserves'),
      annualRentGrowth: document.getElementById('annualRentGrowth'),
      holdPeriod: document.getElementById('holdPeriod'),
      ltvPercent: document.getElementById('ltvPercent'),
      mortgageRate: document.getElementById('mortgageRate'),
      exitCapRate: document.getElementById('exitCapRate'),
      unleveredDiscountRate: document.getElementById('unleveredDiscountRate')
    };

    this.btnViewCashFlows = document.getElementById('btnViewCashFlows');
    this.btnViewExitCapital = document.getElementById('btnViewExitCapital');
    this.chartSubtitle = document.getElementById('chartViewSubtitle');
    this.currentChartView = 'cashFlows';

    this.exportBtn = document.getElementById('btnExportCsv');

    this.metricsView = new DCFMetricsView();
    this.chartView = new DCFChartView(document.getElementById('dcfCanvas'));
    this.tableView = new DCFProFormaTableView(document.getElementById('proFormaBody'));

    this.currentModelResult = null;

    this.init();
  }

  init() {
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.update());
        input.addEventListener('change', () => this.update());
      }
    });

    if (this.btnViewCashFlows) {
      this.btnViewCashFlows.addEventListener('click', () => this.setChartView('cashFlows'));
    }
    if (this.btnViewExitCapital) {
      this.btnViewExitCapital.addEventListener('click', () => this.setChartView('exitCapital'));
    }

    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        if (this.currentModelResult) {
          exportDCFToCSV(this.currentModelResult);
        }
      });
    }

    window.addEventListener('resize', () => {
      if (this.currentModelResult) {
        this.chartView.render(this.currentModelResult, this.currentChartView);
      }
    });

    this.update();
  }

  setChartView(mode) {
    this.currentChartView = mode;
    if (this.btnViewCashFlows) {
      this.btnViewCashFlows.classList.toggle('active', mode === 'cashFlows');
    }
    if (this.btnViewExitCapital) {
      this.btnViewExitCapital.classList.toggle('active', mode === 'exitCapital');
    }
    if (this.chartSubtitle) {
      this.chartSubtitle.textContent = mode === 'cashFlows'
        ? 'Annual Unlevered (FCFF) vs. Levered (FCFE) Distributions'
        : 'Terminal Exit Price Distribution (Senior Loan Payoff vs. Net Equity Realization)';
    }
    this.chartView.render(this.currentModelResult, this.currentChartView);
  }

  getValues() {
    return {
      purchasePrice: parseFloat(this.inputs.purchasePrice?.value) || 0,
      potentialGrossIncome: parseFloat(this.inputs.potentialGrossIncome?.value) || 0,
      vacancyRatePercent: parseFloat(this.inputs.vacancyRate?.value) || 0,
      operatingExpenseRatio: parseFloat(this.inputs.opexRatio?.value) || 0,
      capitalReservesAnnual: parseFloat(this.inputs.capitalReserves?.value) || 0,
      annualRentGrowth: parseFloat(this.inputs.annualRentGrowth?.value) || 0,
      holdPeriodYears: parseInt(this.inputs.holdPeriod?.value, 10) || 5,
      ltvPercent: parseFloat(this.inputs.ltvPercent?.value) || 0,
      mortgageRate: parseFloat(this.inputs.mortgageRate?.value) || 0,
      exitCapRate: parseFloat(this.inputs.exitCapRate?.value) || 6.25,
      unleveredDiscountRate: parseFloat(this.inputs.unleveredDiscountRate?.value) || 8.0
    };
  }

  update() {
    const rawValues = this.getValues();
    this.currentModelResult = computeDCFValuation(rawValues);

    this.metricsView.render(this.currentModelResult);
    this.chartView.render(this.currentModelResult, this.currentChartView);
    this.tableView.render(this.currentModelResult);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DCFController());
} else {
  new DCFController();
}