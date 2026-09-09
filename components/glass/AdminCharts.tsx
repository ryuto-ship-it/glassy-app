import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Polyline } from 'react-native-svg';

// Only ever rendered inside the always-dark admin dashboard — see
// constants/theme.ts / themeScope.tsx.
import { darkColors as colors, fonts, radius, spacing } from '@/constants/theme';
import { CountUpText } from './CountUpText';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export type ChartSlice = { label: string; value: number; color: string };

// A donut chart built directly on react-native-svg (no chart library) —
// each slice is a full circle stroked with a dash pattern sized to its
// share of the total, rotated into place by stroke-dashoffset. On mount,
// every slice sweeps in from 0 length so the chart reads as data being
// tallied up rather than appearing pre-computed.
export function DonutChart({ data, size = 140, strokeWidth = 20 }: { data: ChartSlice[]; size?: number; strokeWidth?: number }) {
  const reducedMotion = useReducedMotion();
  const radius_ = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius_;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let cumulative = 0;
  const arcs = data.map((slice) => {
    const fraction = slice.value / total;
    const length = circumference * fraction;
    const offset = circumference * cumulative;
    cumulative += fraction;
    return { ...slice, length, offset };
  });

  const draw = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    draw.value = reducedMotion ? 1 : 0;
    draw.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, data.map((d) => d.value).join(',')]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius_} stroke={colors.borderDim} strokeWidth={strokeWidth} fill="none" />
        {arcs.map((arc) => (
          <DonutArc key={arc.label} arc={arc} draw={draw} size={size} radius_={radius_} strokeWidth={strokeWidth} circumference={circumference} />
        ))}
      </Svg>
    </View>
  );
}

function DonutArc({
  arc,
  draw,
  size,
  radius_,
  strokeWidth,
  circumference,
}: {
  arc: ChartSlice & { length: number; offset: number };
  draw: SharedValue<number>;
  size: number;
  radius_: number;
  strokeWidth: number;
  circumference: number;
}) {
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return { strokeDasharray: `${arc.length * draw.value}, ${circumference}` };
  });
  return (
    <AnimatedCircle
      cx={size / 2}
      cy={size / 2}
      r={radius_}
      stroke={arc.color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDashoffset={-arc.offset}
      animatedProps={animatedProps}
      transform={`rotate(-90 ${size / 2} ${size / 2})`}
    />
  );
}

export function ChartLegend({ data }: { data: ChartSlice[] }) {
  return (
    <View style={styles.legend}>
      {data.map((d) => (
        <View key={d.label} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: d.color }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>
            {d.label}
          </Text>
          <Text style={styles.legendValue}>{d.value}%</Text>
        </View>
      ))}
    </View>
  );
}

// Single-series horizontal bars — each fill grows in from 0 width, staggered
// bar-by-bar so the list reads as being tallied rather than snapping in.
export function SimpleBarChart({ data, unit = '%' }: { data: ChartSlice[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ gap: spacing.sm }}>
      {data.map((d, i) => (
        <SimpleBarRow key={d.label} d={d} max={max} unit={unit} index={i} />
      ))}
    </View>
  );
}

function SimpleBarRow({ d, max, unit, index }: { d: ChartSlice; max: number; unit: string; index: number }) {
  const reducedMotion = useReducedMotion();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(
      reducedMotion ? 0 : index * 90,
      withTiming((d.value / max) * 100, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.value, max, index, reducedMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{d.label}</Text>
        <Text style={styles.barValue}>
          {d.value}
          {unit}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { backgroundColor: d.color }, fillStyle]} />
      </View>
    </View>
  );
}

export type GroupedBarGroup = { label: string; a: number; b: number };

// Two-series grouped bars (e.g. age band x gender) rendered as small
// side-by-side columns per group, each growing in from the baseline.
export function GroupedBarChart({
  groups,
  seriesLabels,
  colorA,
  colorB,
  height = 110,
}: {
  groups: GroupedBarGroup[];
  seriesLabels: [string, string];
  colorA: string;
  colorB: string;
  height?: number;
}) {
  const max = Math.max(...groups.flatMap((g) => [g.a, g.b]), 1);
  return (
    <View>
      <View style={[styles.groupedRow, { height }]}>
        {groups.map((g, i) => (
          <GroupedBarCol key={g.label} g={g} max={max} height={height} colorA={colorA} colorB={colorB} index={i} />
        ))}
      </View>
      <View style={styles.groupedLegendRow}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colorA }]} />
          <Text style={styles.legendLabel}>{seriesLabels[0]}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colorB }]} />
          <Text style={styles.legendLabel}>{seriesLabels[1]}</Text>
        </View>
      </View>
    </View>
  );
}

function GroupedBarCol({
  g,
  max,
  height,
  colorA,
  colorB,
  index,
}: {
  g: GroupedBarGroup;
  max: number;
  height: number;
  colorA: string;
  colorB: string;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const ha = useSharedValue(0);
  const hb = useSharedValue(0);
  const target = height - 24;

  useEffect(() => {
    const delay = reducedMotion ? 0 : index * 90;
    ha.value = withDelay(delay, withTiming((g.a / max) * target, { duration: 650, easing: Easing.out(Easing.cubic) }));
    hb.value = withDelay(delay + 60, withTiming((g.b / max) * target, { duration: 650, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.a, g.b, max, target, index, reducedMotion]);

  const styleA = useAnimatedStyle(() => ({ height: ha.value }));
  const styleB = useAnimatedStyle(() => ({ height: hb.value }));

  return (
    <View style={styles.groupedCol}>
      <View style={styles.groupedBars}>
        <Animated.View style={[styles.groupedBar, { backgroundColor: colorA }, styleA]} />
        <Animated.View style={[styles.groupedBar, { backgroundColor: colorB }, styleB]} />
      </View>
      <Text style={styles.groupedLabel}>{g.label}</Text>
    </View>
  );
}

// Tiny SVG sparkline for a growth trend (e.g. stablecoin payment share
// over the last N months) — the line draws itself left-to-right on mount.
export function MiniTrendLine({ points, color, width = 140, height = 40 }: { points: number[]; color: string; width?: number; height?: number }) {
  const reducedMotion = useReducedMotion();
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const xy = points.map((p, i) => [i * step, height - ((p - min) / span) * height] as const);
  const coords = xy.map(([x, y]) => `${x},${y}`).join(' ');
  const totalLength = xy.slice(1).reduce((sum, [x, y], i) => {
    const [px, py] = xy[i];
    return sum + Math.hypot(x - px, y - py);
  }, 0);

  const draw = useSharedValue(0);
  useEffect(() => {
    draw.value = 0;
    draw.value = withTiming(1, { duration: reducedMotion ? 200 : 900, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.join(','), reducedMotion]);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return { strokeDashoffset: totalLength * (1 - draw.value) };
  });
  const dotProps = useAnimatedProps(() => {
    'worklet';
    return { opacity: draw.value };
  });

  const [lastX, lastY] = xy[xy.length - 1];

  return (
    <Svg width={width} height={height}>
      <AnimatedPolyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        animatedProps={animatedProps}
      />
      <AnimatedCircle cx={lastX} cy={lastY} r={3.5} fill={color} animatedProps={dotProps} />
    </Svg>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  numericValue,
  formatter,
}: {
  label: string;
  value?: string;
  sub?: string;
  numericValue?: number;
  formatter?: (n: number) => string;
}) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      {numericValue !== undefined ? (
        <CountUpText value={numericValue} duration={900} formatter={formatter} style={styles.kpiValue} />
      ) : (
        <Text style={styles.kpiValue}>{value}</Text>
      )}
      {sub && <Text style={styles.kpiSub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontFamily: fonts.bodyMed, fontSize: 11.5, color: colors.textMuted },
  legendValue: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.text },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontFamily: fonts.bodyMed, fontSize: 11.5, color: colors.text },
  barValue: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.textMuted },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  groupedRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  groupedCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  groupedBars: { flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  groupedBar: { width: 10, borderRadius: 3 },
  groupedLabel: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, marginTop: 6 },
  groupedLegendRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, justifyContent: 'center' },
  kpiCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDim,
    padding: spacing.lg,
  },
  kpiLabel: { fontFamily: fonts.bodyMed, fontSize: 10.5, color: colors.textMuted },
  kpiValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text, marginTop: 6 },
  kpiSub: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.success, marginTop: 4 },
});
