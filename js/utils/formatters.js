/**
 * Global Presentation Formatters
 * Pure functions: numbers in -> formatted strings out.
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
  minimumFractionDigits: 2,
  maximumFractionDigits: 3
});

export function formatCurrency(value) {
  if (isNaN(value) || value === null) return '$0';
  return currencyFormatter.format(Math.round(value));
}

export function formatCurrencyCents(value) {
  if (isNaN(value) || value === null) return '$0.00';
  return currencyCentsFormatter.format(value);
}

export function formatPercent(value) {
  if (isNaN(value) || value === null) return '0.00%';
  return `${percentFormatter.format(value)}%`;
}

export function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months} mos`;
  if (months === 0) return `${years} yrs`;
  return `${years} yrs, ${months} mos`;
}