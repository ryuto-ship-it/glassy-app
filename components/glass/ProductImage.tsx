import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Product } from '@/data/mock';
import { useIsDarkScope } from '@/constants/themeScope';
import { ProductArt } from './ProductArt';

type Props = {
  product: Product;
  style?: StyleProp<ViewStyle>;
};

// Renders a real package photo when the product has one (see Product.photo
// in data/mock.ts), falling back to the illustrated ProductArt silhouette
// for the rest of the catalog. Real photos sit on a flat light card — they
// come from product-page screenshots, so a plain neutral backdrop reads
// better than the dark jewel-tone gradient used behind illustrated art.
export function ProductImage({ product, style }: Props) {
  const dark = useIsDarkScope();
  if (!product.photo) {
    return <ProductArt seed={product.id} shape={product.shape} style={style} />;
  }
  return (
    <View style={[styles.wrap, dark ? styles.wrapDark : styles.wrapLight, style]}>
      <Image source={product.photo} style={StyleSheet.absoluteFill} contentFit="contain" />
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
