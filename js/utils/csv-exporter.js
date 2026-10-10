/**
 * CSV Exporter Utility
 * Serializes amortization schedule datasets into downloadable CSV files.
 */

export function exportScheduleToCSV(schedule, filename = 'amortization-schedule.csv') {
  if (!Array.isArray(schedule) || schedule.length === 0) return;

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

  const rows = schedule.map(row => [
    row.month,
    row.scheduledPayment.toFixed(2),
    row.principal.toFixed(2),
    row.interest.toFixed(2),
    row.extra.toFixed(2),
    row.totalPayment.toFixed(2),
    row.remainingBalance.toFixed(2),
    row.cumulativeInterest.toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
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