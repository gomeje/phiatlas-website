/**
 * Amortization Table View
 * Formats and inserts schedule rows into the HTML table tbody.
 */
import { formatCurrencyCents } from '../utils/formatters.js';

export class AmortizationTableView {
  constructor(tbodyElement) {
    this.tbody = tbodyElement;
  }

  render(schedule, limitMonths = 120) {
    if (!this.tbody) return;

    this.tbody.innerHTML = '';
    const slice = schedule.slice(0, limitMonths);

    const fragment = document.createDocumentFragment();

    slice.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.month}</td>
        <td>${formatCurrencyCents(row.principal)}</td>
        <td>${formatCurrencyCents(row.interest)}</td>
        <td>${formatCurrencyCents(row.extra)}</td>
        <td>${formatCurrencyCents(row.remainingBalance)}</td>
      `;
      fragment.appendChild(tr);
    });

    this.tbody.appendChild(fragment);
  }
}