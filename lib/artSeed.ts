export function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(h);
}

// Curated on-brand gradient pairs, so decorative art never clashes with the palette.
export const ART_GRADIENTS: readonly [string, string][] = [
  ['#FFD1DC', '#D8C7F5'],
  ['#D8C7F5', '#C6F2E4'],
  ['#FFD1DC', '#C6F2E4'],
  ['#F1EAF4', '#D8C7F5'],
  ['#C6F2E4', '#FFB9C9'],
  ['#E9E0FB', '#FFE3EA'],
];

export function gradientForSeed(seed: string): readonly [string, string] {
  return ART_GRADIENTS[hashSeed(seed) % ART_GRADIENTS.length];
}
