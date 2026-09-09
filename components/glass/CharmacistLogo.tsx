import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  // Square render size in px.
  size?: number;
  // Wraps the mark in a white rounded chip — the only logo file we have is
  // the color version with dark wordmark text, which disappears against
  // this app's dark-scope screens (Wallet, admin, welcome, desktop nav).
  // A white chip keeps it legible there without needing a separate
  // reversed/white asset.
  chip?: boolean;
  style?: StyleProp<ViewStyle>;
};

// 참약사(Charmacist) partner mark — see assets/brand/charmacist-logo.png.
export function CharmacistLogo({ size = 28, chip = false, style }: Props) {
  const mark = (
    <Image
      source={require('../../assets/brand/charmacist-logo.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
  if (!chip) return <View style={style}>{mark}</View>;
  const pad = Math.round(size * 0.16);
  return (
    <View style={[styles.chip, { padding: pad, borderRadius: (size + pad * 2) / 2 }, style]}>
      {mark}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
