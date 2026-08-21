import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors, fonts, radius, spacing } from '@/constants/theme';

export type ChartSlice = { label: string; value: number; color: string };

// A donut chart built directly on react-native-svg (no chart library) —
// each slice is a full circle stroked with a dash pattern sized to its
// share of the total, rotated into place by stroke-dashoffset.
export function DonutChart({ data, size = 140, strokeWidth = 20 }: { data: ChartSlice[]; size?: number; strokeWidth?: number }) {
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

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius_} stroke={colors.borderDim} strokeWidth={strokeWidth} fill="none" />
        {arcs.map((arc) => (
          <Circle
            key={arc.label}
            cx={size / 2}
            cy={size / 2}
            r={radius_}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arc.length}, ${circumference}`}
            strokeDashoffset={-arc.offset * circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </Svg>
    </View>
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

// Single-series horizontal bars — plain Views, no SVG needed.
export function SimpleBarChart({ data, unit = '%' }: { data: ChartSlice[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ gap: spacing.sm }}>
      {data.map((d) => (
        <View key={d.label}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>{d.label}</Text>
            <Text style={styles.barValue}>
              {d.value}
              {unit}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(d.value / max) * 100}%`, backgroundColor: d.color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export type GroupedBarGroup = { label: string; a: number; b: number };

// Two-series grouped bars (e.g. age band x gender) rendered as small
// side-by-side columns per group.
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
        {groups.map((g) => (
          <View key={g.label} style={styles.groupedCol}>
            <View style={styles.groupedBars}>
              <View style={[styles.groupedBar, { height: (g.a / max) * (height - 24), backgroundColor: colorA }]} />
              <View style={[styles.groupedBar, { height: (g.b / max) * (height - 24), backgroundColor: colorB }]} />
            </View>
            <Text style={styles.groupedLabel}>{g.label}</Text>
          </View>
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

// Tiny SVG sparkline for a growth trend (e.g. stablecoin payment share
// over the last N months).
export function MiniTrendLine({ points, color, width = 140, height = 40 }: { points: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => `${i * step},${height - ((p - min) / span) * height}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={coords} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={i * step} cy={height - ((p - min) / span) * height} r={i === points.length - 1 ? 3.5 : 0} fill={color} />
      ))}
    </Svg>
  );
}

export function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
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
