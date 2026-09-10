import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors, darkColors, fonts, spacing } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';
import { CHARM_PRICE_HISTORY, PricePoint } from '@/data/mock';
import { formatUsd } from '@/lib/format';

function buildLinePath(prices: number[], width: number, height: number, padY = 4) {
  if (prices.length < 2) return { line: '', area: '', points: [] as { x: number; y: number }[], min: 0, max: 0 };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const stepX = width / (prices.length - 1);
  const points = prices.map((p, i) => {
    const x = i * stepX;
    const y = padY + (1 - (p - min) / span) * (height - padY * 2);
    return { x, y };
  });
  const line = points.map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area, points, min, max };
}

type ChartProps = {
  data: PricePoint[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  strokeWidth?: number;
  // Marks the most recent data point with a small dot, so the chart reads
  // as "current price" rather than an abstract squiggle.
  showDot?: boolean;
  // Faint horizontal reference lines + min/max price labels — the minimum
  // context a real price chart needs instead of a bare line.
  showGrid?: boolean;
  periodLabel?: string;
};

// Custom SVG line chart — no external charting library. Used both as a
// tiny sparkline and as the full period chart on the wallet screen.
export function PriceChart({
  data,
  width = 320,
  height = 120,
  color = colors.accentBlue,
  showArea = true,
  strokeWidth = 2.5,
  showDot = false,
  showGrid = false,
  periodLabel,
}: ChartProps) {
  const dark = useIsDarkScope();
  const c = dark ? darkColors : colors;
  const prices = data.map((d) => d.price);
  const { line, area, points, min, max } = useMemo(() => buildLinePath(prices, width, height), [prices, width, height]);
  const gradId = `pc-${color.replace('#', '')}-${Math.round(width)}-${Math.round(height)}`;
  const last = points[points.length - 1];

  if (width <= 0) return <View style={{ width, height }} />;

  return (
    <View>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {showGrid &&
          [0.25, 0.5, 0.75].map((f) => (
            <Line
              key={f}
              x1={0}
              x2={width}
              y1={height * f}
              y2={height * f}
              stroke={c.borderDim}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}
        {showArea && <Path d={area} fill={`url(#${gradId})`} />}
        <Path d={line} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {showDot && last && (
          <>
            <Circle cx={last.x} cy={last.y} r={5.5} fill={color} opacity={0.25} />
            <Circle cx={last.x} cy={last.y} r={3} fill={color} stroke={dark ? '#0B0B0D' : '#FFFFFF'} strokeWidth={1.5} />
          </>
        )}
      </Svg>
      {showGrid && (
        <>
          <Text style={[styles.gridLabel, styles.gridLabelTop, { color: c.textFaint }]}>{formatUsd(max)}</Text>
          <Text style={[styles.gridLabel, styles.gridLabelBottom, { color: c.textFaint }]}>{formatUsd(min)}</Text>
          {periodLabel && (
            <Text style={[styles.gridLabel, styles.gridLabelPeriod, { color: c.textFaint }]}>{periodLabel}</Text>
          )}
        </>
      )}
    </View>
  );
}

export function Sparkline({
  data,
  width = 84,
  height = 32,
  color = colors.success,
}: {
  data: PricePoint[];
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <PriceChart data={data} width={width} height={height} color={color} showArea strokeWidth={1.8} showDot />
  );
}

export function get24hChange(): { price: number; changePct: number; up: boolean } {
  const last = CHARM_PRICE_HISTORY[CHARM_PRICE_HISTORY.length - 1].price;
  const prev = CHARM_PRICE_HISTORY[CHARM_PRICE_HISTORY.length - 2].price;
  const changePct = ((last - prev) / prev) * 100;
  return { price: last, changePct, up: changePct >= 0 };
}

type TickerProps = {
  showSparkline?: boolean;
};

export function PriceTicker({ showSparkline = true }: TickerProps) {
  const dark = useIsDarkScope();
  const c = dark ? darkColors : colors;
  const { price, changePct, up } = get24hChange();
  const trendColor = up ? c.success : c.danger;

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: c.textMuted }]}>$CHARM</Text>
        <Text style={[styles.price, { color: c.text }]}>{formatUsd(price)}</Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeArrow, { color: trendColor }]}>{up ? '▲' : '▼'}</Text>
          <Text style={[styles.change, { color: trendColor }]}>{Math.abs(changePct).toFixed(2)}%</Text>
          <Text style={[styles.changeSub, { color: c.textFaint }]}>24H</Text>
        </View>
      </View>
      {showSparkline && <Sparkline data={CHARM_PRICE_HISTORY.slice(-14)} color={trendColor} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.5 },
  price: { fontFamily: fonts.display, fontSize: 24, marginTop: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  changeArrow: { fontSize: 10 },
  change: { fontFamily: fonts.bodyBold, fontSize: 12 },
  changeSub: { fontFamily: fonts.bodyMed, fontSize: 11 },
  gridLabel: { position: 'absolute', fontFamily: fonts.bodyMed, fontSize: 9.5 },
  gridLabelTop: { top: 0, left: 2 },
  gridLabelBottom: { bottom: 0, left: 2 },
  gridLabelPeriod: { bottom: 0, right: 2 },
});
