export function formatGlas(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatSigned(n: number): string {
  const rounded = Math.round(n);
  if (rounded === 0) return '±0';
  return rounded > 0 ? `+${rounded.toLocaleString('en-US')}` : rounded.toLocaleString('en-US');
}
