import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewProps } from 'react-native';

import { darkBackgroundGradient, lightBackgroundGradient } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';

// Full-bleed wash that sits behind every screen. Light (ivory) by default;
// screens wrapped in <DarkScope> (Wallet, payment modals, admin, etc) get
// the original dark premium-glass wash instead.
export function AppBackground({ style, children, ...rest }: ViewProps) {
  const dark = useIsDarkScope();
  return (
    <View style={[StyleSheet.absoluteFill, style]} {...rest}>
      <LinearGradient
        colors={dark ? darkBackgroundGradient : lightBackgroundGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blobViolet, dark && styles.blobVioletDark]} />
      <View style={[styles.blobGold, dark && styles.blobGoldDark]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blobViolet: {
    position: 'absolute',
    top: -60,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: 'rgba(177,140,255,0.07)',
  },
  blobVioletDark: { backgroundColor: 'rgba(177,140,255,0.10)' },
  blobGold: {
    position: 'absolute',
    bottom: 60,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: 'rgba(232,196,104,0.05)',
  },
  blobGoldDark: { backgroundColor: 'rgba(232,196,104,0.06)' },
});
