import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Product } from '@/data/mock';
import { useIsDarkScope } from '@/constants/themeScope';
import { pickProductPhoto } from '@/lib/productPhotos';

type Props = {
  product: Product;
  style?: StyleProp<ViewStyle>;
};

// Renders a real package photo when the product has one (see Product.photo
// in data/mock.ts); otherwise borrows one of the other real photos we have
// on hand (see lib/productPhotos) so the shop floor never shows an
// illustrated placeholder next to real photography.
export function ProductImage({ product, style }: Props) {
  const dark = useIsDarkScope();
  const photo = product.photo ?? pickProductPhoto(product.id);
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
