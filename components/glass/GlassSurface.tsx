import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { colors, darkColors, radius as radiusTokens, shadow, darkShadow } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';

type Props = ViewProps & {
  intensity?: number;
  padding?: number;
  radius?: number;
  strong?: boolean;
  noBorder?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

// The core card primitive used across GLASSY. Light by default — a clean
// white "premium beauty commerce" card with a soft shadow — except inside
// <DarkScope> (Wallet, payment modals, admin, etc), where it renders the
// original blurred, near-black translucent "premium dark glass" treatment.
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
  const dark = useIsDarkScope();

  if (!dark) {
    return (
      <View
        style={[
          {
            borderRadius: radius,
            backgroundColor: colors.surface,
            borderWidth: noBorder ? 0 : 1,
            borderColor: colors.border,
          },
          elevated ? shadow.soft : undefined,
          style,
        ]}
        {...rest}
      >
        <View style={{ padding }}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        { borderRadius: radius, overflow: 'hidden', backgroundColor: darkColors.surface },
        elevated ? darkShadow.soft : undefined,
        style,
      ]}
      {...rest}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? darkColors.glassFillStrong : darkColors.glassFill },
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
            borderColor: noBorder ? 'transparent' : darkColors.border,
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
