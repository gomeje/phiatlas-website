/**
 * DCF Pro Forma Table View
 */
import { formatCurrency } from '../utils/formatters.js';

export class DCFProFormaTableView {
  constructor(tbodyElement) {
    this.tbody = tbodyElement;
    this.table = tbodyElement ? tbodyElement.closest('table') : null;
  }

  render(model) {
    if (!this.tbody || !this.table || !model) return;

    const { proForma } = model;
    const thead = this.table.querySelector('thead');
    if (!thead) return;

    // 1. Render Table Header
    thead.innerHTML = `
      <tr>
        <th style="text-align: left;">Line Item</th>
        ${proForma.map(p => `<th>Year ${p.year}</th>`).join('')}
      </tr>
    `;

    // 2. Define Line Items
    const rows = [
      { label: 'Potential Gross Income (PGI)', key: 'pgi', bold: false },
      { label: 'less: Vacancy & Credit Loss', key: 'vacancyLoss', bold: false, negative: true },
      { label: 'Effective Gross Income (EGI)', key: 'egi', bold: true },
      { label: 'less: Operating Expenses (OpEx)', key: 'opex', bold: false, negative: true },
      { label: 'Net Operating Income (NOI)', key: 'noi', bold: true },
      { label: 'less: Capital Reserves / CapEx', key: 'capitalReserves', bold: false, negative: true },
      { label: 'Unlevered FCF (FCFF)', key: 'ufcf', bold: true, highlight: 'stone' },
      { label: 'less: Senior Debt Service', key: 'debtService', bold: false, negative: true },
      { label: 'Levered FCF (FCFE)', key: 'lfcf', bold: true, highlight: 'gold' }
    ];

    // 3. Render Table Rows
    this.tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    rows.forEach(r => {
      const tr = document.createElement('tr');
      let html = `<td style="text-align: left; ${r.bold ? 'font-weight: 600;' : ''}">${r.label}</td>`;

      proForma.forEach(yr => {
        const val = yr[r.key];
        const displayVal = r.negative ? `(${formatCurrency(val)})` : formatCurrency(val);
        const colorStyle = r.highlight === 'gold' ? 'color: var(--color-gold); font-weight: 700;' : '';
        html += `<td style="${colorStyle}">${displayVal}</td>`;
      });

      tr.innerHTML = html;
      fragment.appendChild(tr);
    });

    this.tbody.appendChild(fragment);
  }
}