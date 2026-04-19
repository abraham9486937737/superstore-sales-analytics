export function formatCurrency(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits,
  }).format(Number(value) || 0);
}

export function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits,
  }).format(Number(value) || 0);
}

export function formatPercent(value) {
  return `${((value || 0) * 100).toFixed(2)}%`;
}

export function monthLabel(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}
