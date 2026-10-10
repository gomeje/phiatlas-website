/**
 * Amortization Table View
 */
import { formatCurrencyCents } from '../utils/formatters.js';

export class AmortizationTableView {
  constructor(tbodyElement) {
    this.tbody = tbodyElement;
  }

  render(schedule) {
    if (!this.tbody || !Array.isArray(schedule)) return;

    this.tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    schedule.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:left; font-weight:600;">${row.month}</td>
        <td>${formatCurrencyCents(row.totalPayment)}</td>
        <td>${formatCurrencyCents(row.principal)}</td>
        <td>${formatCurrencyCents(row.interest)}</td>
        <td>${formatCurrencyCents(row.extra)}</td>
        <td>${formatCurrencyCents(row.cumulativeInterest)}</td>
        <td style="font-weight:600;">${formatCurrencyCents(row.remainingBalance)}</td>
      `;
      fragment.appendChild(tr);
    });

    this.tbody.appendChild(fragment);
  }
}