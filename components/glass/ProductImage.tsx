import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Product } from '@/data/mock';
import { useIsDarkScope } from '@/constants/themeScope';
import { hashSeed } from '@/lib/artSeed';

type Props = {
  product: Product;
  style?: StyleProp<ViewStyle>;
};

// Every real package photo we have on hand. Products without their own
// `photo` (see data/mock.ts) borrow one of these — deterministically, by
// id, so a given product always shows the same photo — rather than the
// illustrated ProductArt silhouette, which reads as an obvious placeholder
// next to real photography elsewhere on the same screen.
const FALLBACK_PHOTOS = [
  require('../../assets/products/real/lemona.png'),
  require('../../assets/products/real/gaseuhwalmyeongsu.png'),
  require('../../assets/products/real/cheong-kwan-jang-ginseng.png'),
  require('../../assets/products/real/lactofit-gold.png'),
  require('../../assets/products/real/madecassol.png'),
  require('../../assets/products/real/sinsinpas-zero-ice.png'),
  require('../../assets/products/real/insadol-plus.png'),
  require('../../assets/products/real/tylenol.png'),
];

// Renders a real package photo when the product has one (see Product.photo
// in data/mock.ts); otherwise borrows one from FALLBACK_PHOTOS so the shop
// floor never shows an illustrated placeholder next to real photography.
export function ProductImage({ product, style }: Props) {
  const dark = useIsDarkScope();
  const photo = product.photo ?? FALLBACK_PHOTOS[hashSeed(product.id) % FALLBACK_PHOTOS.length];
  return (
    <View style={[styles.wrap, dark ? styles.wrapDark : styles.wrapLight, style]}>
      <Image source={photo} style={StyleSheet.absoluteFill} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  wrapLight: { backgroundColor: '#FFFFFF' },
  wrapDark: { backgroundColor: '#F3F1EC' },
});
