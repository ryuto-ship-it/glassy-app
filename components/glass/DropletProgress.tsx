import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const DROPLET_PATH =
  'M50 4C50 4 14 46 14 70C14 88.5 30 98 50 98C70 98 86 88.5 86 70C86 46 50 4 50 4Z';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  size?: number;
  percent: number; // 0..1
  colors: readonly string[];
  children?: React.ReactNode;
};

// Signature GLASSY progress indicator — a droplet that visibly "fills up"
// toward the next glow tier, instead of a generic progress bar.
export function DropletProgress({ size = 120, percent, colors, children }: Props) {
  const clamped = Math.max(0.03, Math.min(1, percent));
  const fillY = useSharedValue(98 - clamped * 90);
  const bob = useSharedValue(0);
  const gradId = `droplet-fill-${size}`;
  const clipId = `droplet-clip-${size}`;

  useEffect(() => {
    fillY.value = withTiming(98 - clamped * 90, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [clamped, fillY]);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [bob]);

  const animatedProps = useAnimatedProps(() => ({
    y: fillY.value + bob.value * 1.1,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors[colors.length - 1]} />
            <Stop offset="1" stopColor={colors[0]} />
          </LinearGradient>
          <ClipPath id={clipId}>
            <Path d={DROPLET_PATH} />
          </ClipPath>
        </Defs>
        {/* droplet outline / empty state */}
        <Path d={DROPLET_PATH} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.28)" strokeWidth={2} />
        {/* animated fill, clipped to droplet silhouette */}
        <AnimatedRect
          x={0}
          width={100}
          height={140}
          fill={`url(#${gradId})`}
          clipPath={`url(#${clipId})`}
          animatedProps={animatedProps}
        />
        {/* glossy highlight */}
        <Path d="M34 30C34 30 26 44 26 54" stroke="rgba(255,255,255,0.7)" strokeWidth={4} strokeLinecap="round" fill="none" />
      </Svg>
      {children ? (
        <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
