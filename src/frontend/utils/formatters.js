export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
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
