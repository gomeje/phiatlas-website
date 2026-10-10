/**
 * Global Presentation Formatters
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const currencyCentsFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
});

export function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '$0';
  return currencyFormatter.format(Math.round(num));
}

export function formatCurrencyCents(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '$0.00';
  return currencyCentsFormatter.format(num);
}

export function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.0%';
  return `${percentFormatter.format(num)}%`;
}

export function formatDuration(totalMonths) {
  const monthsTotal = parseInt(totalMonths, 10);
  if (!Number.isFinite(monthsTotal) || monthsTotal <= 0) return '0 Yrs';
  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;

  if (years === 0) return `${months}m`;
  if (months === 0) return `${years} Yrs`;
  return `${years}y ${months}m`;
}