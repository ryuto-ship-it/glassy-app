import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { radius as radiusTokens } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function SkeletonBlock({ width = '100%', height = 16, radius = radiusTokens.sm, style }: Props) {
  const dark = useIsDarkScope();
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.09)' },
        animStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const dark = useIsDarkScope();
  return (
    <View style={[styles.card, { backgroundColor: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.04)' }]}>
      <SkeletonBlock height={90} radius={radiusTokens.md} />
      <View style={{ height: 10 }} />
      <SkeletonBlock height={14} width="70%" />
      <View style={{ height: 6 }} />
      <SkeletonBlock height={12} width="45%" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radiusTokens.lg,
    padding: 14,
  },
});
