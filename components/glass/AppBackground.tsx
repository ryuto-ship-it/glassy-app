import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewProps } from 'react-native';

import { gradients } from '@/constants/theme';

// Full-bleed dark gradient wash that sits behind every screen so the
// dark-glass cards have a subtle, premium backdrop to blur against.
export function AppBackground({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[StyleSheet.absoluteFill, style]} {...rest}>
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blobViolet]} />
      <View style={[styles.blobGold]} />
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
    backgroundColor: 'rgba(177,140,255,0.10)',
  },
  blobGold: {
    position: 'absolute',
    bottom: 60,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: 'rgba(232,196,104,0.06)',
  },
});
