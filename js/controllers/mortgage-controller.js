/**
 * Mortgage Advisory Controller
 * Entry point for /tools/mortgage-amortization/
 */
import { computeComparativeModel } from '../models/amortization-model.js';
import { MortgageMetricsView } from '../views/mortgage-metrics-view.js';
import { AmortizationChartView } from '../views/amortization-chart-view.js';
import { AmortizationTableView } from '../views/amortization-table-view.js';
import { exportScheduleToCSV } from '../utils/csv-exporter.js';

class MortgageController {
  constructor() {
    this.inputs = {
      price: document.getElementById('input-price'),
      downPayment: document.getElementById('input-down'),
      rate: document.getElementById('input-rate'),
      term: document.getElementById('input-term'),
      extraMonthly: document.getElementById('input-extra-monthly'),
      lumpSum: document.getElementById('input-lump-sum'),
      lumpMonth: document.getElementById('input-lump-month')
    };

    this.metricsView = new MortgageMetricsView();
    this.chartView = new AmortizationChartView(document.getElementById('amortization-chart'));
    this.tableView = new AmortizationTableView(document.getElementById('schedule-tbody'));

    this.exportBtn = document.getElementById('btn-export-csv');
    this.currentModelResult = null;

    this.init();
  }

  init() {
    // Bind all form inputs
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.update());
      }
    });

    // Bind CSV export
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        if (this.currentModelResult) {
          exportScheduleToCSV(this.currentModelResult.accelerated.schedule);
        }
      });
    }

    // Window resize observer for canvas responsiveness
    window.addEventListener('resize', () => {
      if (this.currentModelResult) {
        this.chartView.render(
          this.currentModelResult.baseline.schedule,
          this.currentModelResult.accelerated.schedule
        );
      }
    });

    // Run initial computation
    this.update();
  }

  getValues() {
    return {
      propertyPrice: parseFloat(this.inputs.price?.value) || 0,
      downPaymentPercent: parseFloat(this.inputs.downPayment?.value) || 0,
      annualRate: parseFloat(this.inputs.rate?.value) || 0,
      termYears: parseFloat(this.inputs.term?.value) || 30,
      extraMonthly: parseFloat(this.inputs.extraMonthly?.value) || 0,
      lumpSumAmount: parseFloat(this.inputs.lumpSum?.value) || 0,
      lumpSumMonth: parseInt(this.inputs.lumpMonth?.value, 10) || 0
    };
  }

  update() {
    const rawValues = this.getValues();
    this.currentModelResult = computeComparativeModel(rawValues);

    this.metricsView.render(this.currentModelResult);
    this.chartView.render(
      this.currentModelResult.baseline.schedule,
      this.currentModelResult.accelerated.schedule
    );
    this.tableView.render(this.currentModelResult.accelerated.schedule);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MortgageController();
});