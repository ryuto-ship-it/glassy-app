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

// Deterministic mock tx hash — same seed always produces the same hash, so
// a given transaction's "on-chain receipt" looks stable across renders.
// Uses a xorshift32 mix (rather than a plain LCG) so the low bits — the
// ones `% 16` actually reads — don't fall into an obviously repeating
// pattern.
export function mockTxHash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let s = h || 0x9e3779b9;
  const chars = '0123456789abcdef';
  let hex = '';
  for (let i = 0; i < 40; i++) {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    hex += chars[s % 16];
  }
  return `0x${hex}`;
}
