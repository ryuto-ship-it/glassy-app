import { BlurView } from 'expo-blur';
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

// The core glassmorphism primitive used across GLASSY: a blurred,
// semi-transparent surface with a soft highlight border.
export function GlassSurface({
  children,
  style,
  intensity = 34,
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
        { borderRadius: radius, overflow: 'hidden' },
        elevated ? shadow.soft : undefined,
        style,
      ]}
      {...rest}
    >
      <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? colors.glassFillStrong : colors.glassFill },
        ]}
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
});
