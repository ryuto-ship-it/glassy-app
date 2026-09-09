import { hashSeed } from './artSeed';

// Every real pharmacy/skincare package photo we have on hand (see
// assets/products/real/). Used both for products that don't have their own
// `photo` (ProductImage) and for community post photos, which are reviews
// of this same kind of product — real medicine/skincare photography reads
// right there, unlike a generic landscape stock photo.
export const REAL_PRODUCT_PHOTOS = [
  require('../assets/products/real/lemona.png'),
  require('../assets/products/real/gaseuhwalmyeongsu.png'),
  require('../assets/products/real/cheong-kwan-jang-ginseng.png'),
  require('../assets/products/real/lactofit-gold.png'),
  require('../assets/products/real/madecassol.png'),
  require('../assets/products/real/sinsinpas-zero-ice.png'),
  require('../assets/products/real/insadol-plus.png'),
  require('../assets/products/real/tylenol.png'),
];

// Deterministic by seed — the same id always resolves to the same photo.
export function pickProductPhoto(seed: string) {
  return REAL_PRODUCT_PHOTOS[hashSeed(seed) % REAL_PRODUCT_PHOTOS.length];
}
