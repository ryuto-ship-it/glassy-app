import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Stop } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Axis = { id: string; label: string };

type Props = {
  axes: Axis[];
  scores: Record<string, number>; // 0..100
  size?: number;
  color?: string;
};

function pointOn(cx: number, cy: number, r: number, angle: number) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
}

function ringPoints(cx: number, cy: number, r: number, n: number) {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const [x, y] = pointOn(cx, cy, r, angle);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

// Custom SVG radar/spider chart — no chart library dependency. Renders a
// grid of concentric rings, one spoke per axis, and a filled polygon for
// the current scores (0-100 per axis).
export function RadarChart({ axes, scores, size = 220, color = colors.accentBlue }: Props) {
  const n = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 34;
  const gradId = `radar-${color.replace('#', '')}-${n}`;
  const reducedMotion = useReducedMotion();

  // Values captured once per axis set — used inside the UI-thread worklet
  // below so it doesn't need to re-read the (non-worklet-safe) `scores`
  // object every frame.
  const values = axes.map((axis) => Math.max(0, Math.min(100, scores[axis.id] ?? 0)) / 100);

  const draw = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    draw.value = reducedMotion ? 1 : 0;
    draw.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), reducedMotion]);

  const polygonProps = useAnimatedProps(() => {
    'worklet';
    const pts = values
      .map((value, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
        const r = maxR * value * draw.value;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    return { points: pts };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.45} />
            <Stop offset="1" stopColor={color} stopOpacity={0.08} />
          </LinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <Polygon
            key={f}
            points={ringPoints(cx, cy, maxR * f, n)}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
        ))}
        {axes.map((axis, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const [x, y] = pointOn(cx, cy, maxR, angle);
          return <Line key={axis.id} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />;
        })}
        <AnimatedPolygon animatedProps={polygonProps} fill={`url(#${gradId})`} stroke={color} strokeWidth={2} />
        {axes.map((axis, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const value = values[i];
          return (
            <RadarDot key={axis.id} draw={draw} cx={cx} cy={cy} angle={angle} maxR={maxR} value={value} color={color} />
          );
        })}
      </Svg>
      {axes.map((axis, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
        const [x, y] = pointOn(cx, cy, maxR + 20, angle);
        return (
          <Text
            key={axis.id}
            style={{
              position: 'absolute',
              left: x - 30,
              top: y - 8,
              width: 60,
              textAlign: 'center',
              fontFamily: fonts.bodyMed,
              fontSize: 11,
              color: colors.textMuted,
            }}
          >
            {axis.label}
          </Text>
        );
      })}
    </View>
  );
}

function RadarDot({
  draw,
  cx,
  cy,
  angle,
  maxR,
  value,
  color,
}: {
  draw: SharedValue<number>;
  cx: number;
  cy: number;
  angle: number;
  maxR: number;
  value: number;
  color: string;
}) {
  const dotProps = useAnimatedProps(() => {
    'worklet';
    const r = maxR * value * draw.value;
    return { cx: cx + r * Math.cos(angle), cy: cy + r * Math.sin(angle), opacity: draw.value };
  });
  return <AnimatedCircle animatedProps={dotProps} r={3.5} fill={color} />;
}
