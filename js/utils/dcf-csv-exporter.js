/**
 * DCF CSV Exporter Utility
 * Serializes DCF pro forma and return metrics into downloadable spreadsheet format
 * with mandatory statutory and non-appraisal compliance notices.
 */

export function exportDCFToCSV(model, filename = 'PhiAtlas_Commercial_DCF_Model.csv') {
  if (!model || !model.proForma) return;

  const disclaimerLines = [
    'PHI ATLAS ADVISORY - COMMERCIAL PROPERTY DCF & VALUATION ENGINE',
    'DISCLAIMER: For educational, illustrative, and hypothetical underwriting screening only.',
    'Jesus Gomez Polo is a Licensed Florida Real Estate Sales Associate with Brokers, LLC (Not an Appraiser, Lender, RIA, or CPA).',
    'Outputs do not constitute a formal property appraisal, valuation, or syndication investment offer.',
    'All brokerage services supervised by Brokers, LLC pursuant to Chapter 475 F.S. and FREC Rules 61J2-10.025 & 61J2-10.026.',
    ''
  ];

  const years = model.proForma.map(p => `Year ${p.year}`);
  const header = ['Line Item', ...years].join(',');

  const rows = [
    ['Potential Gross Income (PGI)', ...model.proForma.map(p => p.pgi.toFixed(2))],
    ['Vacancy Loss', ...model.proForma.map(p => (-p.vacancyLoss).toFixed(2))],
    ['Effective Gross Income (EGI)', ...model.proForma.map(p => p.egi.toFixed(2))],
    ['Operating Expenses (OpEx)', ...model.proForma.map(p => (-p.opex).toFixed(2))],
    ['Net Operating Income (NOI)', ...model.proForma.map(p => p.noi.toFixed(2))],
    ['Capital Reserves', ...model.proForma.map(p => (-p.capitalReserves).toFixed(2))],
    ['Unlevered FCF (FCFF)', ...model.proForma.map(p => p.ufcf.toFixed(2))],
    ['Debt Service', ...model.proForma.map(p => (-p.debtService).toFixed(2))],
    ['Levered FCF (FCFE)', ...model.proForma.map(p => p.lfcf.toFixed(2))],
    [''],
    ['--- RETURN METRICS ---'],
    ['Going-in Cap Rate', `${model.metrics.goingInCapRate.toFixed(2)}%`],
    ['Unlevered IRR', `${model.metrics.unleveredIRR.toFixed(2)}%`],
    ['Levered IRR', `${model.metrics.leveredIRR.toFixed(2)}%`],
    ['Equity Multiple', `${model.metrics.equityMultiple.toFixed(2)}x`],
    ['Year 1 Cash-on-Cash', `${model.metrics.year1CashOnCash.toFixed(2)}%`],
    ['Gross Terminal Sale Price', `$${model.exit.grossExitPrice.toFixed(2)}`],
    ['Net Equity at Disposition', `$${model.exit.netEquityAtExit.toFixed(2)}`]
  ];

  const csvContent = [
    ...disclaimerLines,
    header,
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}