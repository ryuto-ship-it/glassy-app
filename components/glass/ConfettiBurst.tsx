import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DEFAULT_COLORS = ['#4FB6E8', '#1B5FA8', '#E8C468', '#6FD7C4', '#E07A9E'];
const PIECE_COUNT = 26;

type Props = {
  // Bump this (e.g. a counter or Date-free incrementing id) to fire a new
  // burst — the whole piece set remounts and replays from center.
  trigger: number | string;
  colors?: string[];
};

// One-shot celebratory particle burst — used on the welcome-reward moment
// ("+500 CHARM!"). No-ops (renders nothing) when reduce-motion is on.
export function ConfettiBurst({ trigger, colors = DEFAULT_COLORS }: Props) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PIECE_COUNT }).map((_, i) => (
        <ConfettiPiece key={`${trigger}-${i}`} index={i} colors={colors} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index, colors }: { index: number; colors: string[] }) {
  const progress = useSharedValue(0);
  const spread = (Math.PI * 2 * index) / PIECE_COUNT;
  const jitter = (index % 5) * 0.14 - 0.28;
  const angle = spread + jitter;
  const distance = 80 + ((index * 37) % 90);
  const size = 5 + ((index * 13) % 7);
  const color = colors[index % colors.length];
  const rotateDir = index % 2 === 0 ? 1 : -1;
  const durationMs = 850 + ((index * 29) % 400);

  useEffect(() => {
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const x = Math.cos(angle) * distance * p;
    const y = Math.sin(angle) * distance * p + p * p * 46;
    return {
      opacity: 1 - Math.pow(p, 3),
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${p * 300 * rotateDir}deg` },
        { scale: 1 - p * 0.35 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: size,
          height: size * (index % 3 === 0 ? 1 : 1.8),
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
