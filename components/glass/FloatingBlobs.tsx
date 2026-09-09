import { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Blob = {
  size: number;
  top: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  colors: readonly [string, string, ...string[]];
  driftX: number;
  driftY: number;
  duration: number;
};

const BLOBS: Blob[] = [
  { size: 260, top: '4%', left: '-12%', colors: ['#1B5FA8', '#4FB6E8'], driftX: 26, driftY: 34, duration: 9000 },
  { size: 220, top: '38%', right: '-14%', colors: ['#4FB6E8', '#8C7BC2'], driftX: -22, driftY: 24, duration: 11000 },
  { size: 200, top: '68%', left: '-8%', colors: ['#E8C468', '#4FB6E8'], driftX: 20, driftY: -26, duration: 10000 },
];

// Slow-drifting gradient blobs for a "living" background — used on the
// welcome/landing screen. Pure opacity+translate on the UI thread, cheap
// enough to run continuously; collapses to a single static blob when the
// system's reduce-motion preference is on.
export function FloatingBlobs({ style }: { style?: StyleProp<ViewStyle> }) {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, style]} pointerEvents="none">
      {(reducedMotion ? BLOBS.slice(0, 1) : BLOBS).map((b, i) => (
        <BlobShape key={i} blob={b} reducedMotion={reducedMotion} />
      ))}
    </Animated.View>
  );
}

function BlobShape({ blob, reducedMotion }: { blob: Blob; reducedMotion: boolean }) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: blob.duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: blob.duration, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [t, blob.duration, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * blob.driftX },
      { translateY: t.value * blob.driftY },
      { scale: 1 + t.value * 0.06 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: blob.top,
          left: blob.left,
          right: blob.right,
          width: blob.size,
          height: blob.size,
          borderRadius: blob.size / 2,
          overflow: 'hidden',
          opacity: 0.16,
        },
        animStyle,
      ]}
    >
      <LinearGradient colors={blob.colors} style={StyleSheet.absoluteFill} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
