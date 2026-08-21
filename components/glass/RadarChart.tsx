import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Stop } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

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
export function RadarChart({ axes, scores, size = 220, color = colors.accentViolet }: Props) {
  const n = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 34;
  const gradId = `radar-${color.replace('#', '')}-${n}`;

  const dataPoints = axes
    .map((axis, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const value = Math.max(0, Math.min(100, scores[axis.id] ?? 0)) / 100;
      const [x, y] = pointOn(cx, cy, maxR * value, angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

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
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        ))}
        {axes.map((axis, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const [x, y] = pointOn(cx, cy, maxR, angle);
          return <Line key={axis.id} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
        })}
        <Polygon points={dataPoints} fill={`url(#${gradId})`} stroke={color} strokeWidth={2} />
        {axes.map((axis, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const value = Math.max(0, Math.min(100, scores[axis.id] ?? 0)) / 100;
          const [x, y] = pointOn(cx, cy, maxR * value, angle);
          return <Circle key={axis.id} cx={x} cy={y} r={3.5} fill={color} />;
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
