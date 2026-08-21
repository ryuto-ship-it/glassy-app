export function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(h);
}

// Curated dark, premium gradient pairs — used for decorative art (e.g.
// community feed photo placeholders) so it never clashes with the palette.
export const ART_GRADIENTS: readonly [string, string][] = [
  ['#2A2038', '#8C5CE0'],
  ['#241B2E', '#B18CFF'],
  ['#2B2418', '#E8C468'],
  ['#1B2A28', '#6FD7C4'],
  ['#2B1B24', '#E07A9E'],
  ['#1A2032', '#7FA6FF'],
];

export function gradientForSeed(seed: string): readonly [string, string] {
  return ART_GRADIENTS[hashSeed(seed) % ART_GRADIENTS.length];
}
