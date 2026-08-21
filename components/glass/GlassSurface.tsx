import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { colors, radius as radiusTokens, shadow } from '@/constants/theme';

type Props = ViewProps & {
  intensity?: number;
  padding?: number;
  radius?: number;
  strong?: boolean;
  noBorder?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

// The core "premium dark glass" primitive used across GLASSY: a blurred,
// near-black translucent surface with a hairline highlight border and a
// faint top specular edge, evoking a dark fintech/commerce panel rather
// than pastel glassmorphism.
export function GlassSurface({
  children,
  style,
  intensity = 28,
  padding = 16,
  radius = radiusTokens.lg,
  strong = false,
  noBorder = false,
  elevated = false,
  ...rest
}: Props) {
  return (
    <View
      style={[
        { borderRadius: radius, overflow: 'hidden', backgroundColor: colors.surface },
        elevated ? shadow.soft : undefined,
        style,
      ]}
      {...rest}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? colors.glassFillStrong : colors.glassFill },
        ]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topEdge}
      />
      <View
        style={[
          styles.inner,
          {
            padding,
            borderRadius: radius,
            borderColor: noBorder ? 'transparent' : colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    borderWidth: 1,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
