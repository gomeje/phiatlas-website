/**
 * CSV Exporter Utility
 * Serializes amortization schedule datasets into downloadable CSV files
 * with prepended statutory non-lending and FREC regulatory notices.
 */

export function exportScheduleToCSV(schedule, filename = 'PhiAtlas_Amortization_Schedule.csv') {
  if (!Array.isArray(schedule) || schedule.length === 0) return;

  const disclaimerLines = [
    'PHI ATLAS ADVISORY - DEBT AMORTIZATION & ACCELERATION ANALYSIS',
    'DISCLAIMER: For educational and illustrative purposes only. Not an offer to extend credit or a loan commitment.',
    'Jesus Gomez Polo is a Licensed Florida Real Estate Sales Associate with Brokers, LLC (Not an MLO, Lender, or CPA).',
    'Calculations reflect pure P&I debt service and exclude property taxes, hazard insurance, PMI, and HOA fees.',
    'All brokerage transactions supervised by Brokers, LLC pursuant to Chapter 475 F.S. and FREC Rules 61J2-10.025 & 61J2-10.026.',
    '' // Blank separator line
  ];

  const headers = [
    'Month',
    'Scheduled Payment',
    'Principal',
    'Interest',
    'Extra Principal',
    'Total Payment',
    'Remaining Balance',
    'Cumulative Interest'
  ];

  const dataRows = schedule.map(row => [
    row.month,
    row.totalPayment.toFixed(2),
    row.principal.toFixed(2),
    row.interest.toFixed(2),
    row.extra.toFixed(2),
    (row.principal + row.extra).toFixed(2),
    row.remainingBalance.toFixed(2),
    row.cumulativeInterest.toFixed(2)
  ]);

  const csvContent = [
    ...disclaimerLines,
    headers.join(','),
    ...dataRows.map(r => r.join(','))
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