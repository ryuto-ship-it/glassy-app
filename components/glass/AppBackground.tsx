import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewProps } from 'react-native';

import { gradients } from '@/constants/theme';

// Full-bleed soft gradient wash that sits behind every screen so the
// glassmorphism cards have something colorful to blur against.
export function AppBackground({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[StyleSheet.absoluteFill, style]} {...rest}>
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blobPink]} />
      <View style={[styles.blobLavender]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blobPink: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: 'rgba(255,209,220,0.45)',
  },
  blobLavender: {
    position: 'absolute',
    bottom: 40,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: 'rgba(216,199,245,0.4)',
  },
});
