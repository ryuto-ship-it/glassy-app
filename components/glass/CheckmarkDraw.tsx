import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_PATH = 'M6 13.5 L11 18.5 L20 7.5';
// Sum of the two check-mark segment lengths — the dasharray only needs to
// be >= this so the offset trick fully hides the stroke at progress 0.
const CHECK_LENGTH = 23;

type Props = {
  size?: number;
  color?: string;
  delay?: number;
  strokeWidth?: number;
};

// A checkmark that draws itself in (stroke-dashoffset sweep) instead of
// popping in fully-formed — used for payment/step completion moments.
export function CheckmarkDraw({ size = 26, color = '#0B0B0D', delay = 0, strokeWidth = 3 }: Props) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      reducedMotion ? 0 : delay,
      withTiming(1, { duration: reducedMotion ? 150 : 420, easing: Easing.out(Easing.cubic) })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - progress.value),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 26 26">
      <AnimatedPath
        d={CHECK_PATH}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={CHECK_LENGTH}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
