import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors, darkColors, fonts, spacing } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';
import { GLAS_PRICE_HISTORY, PricePoint } from '@/data/mock';
import { formatUsd } from '@/lib/format';

function buildLinePath(prices: number[], width: number, height: number, padY = 4) {
  if (prices.length < 2) return { line: '', area: '' };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const stepX = width / (prices.length - 1);
  const points = prices.map((p, i) => {
    const x = i * stepX;
    const y = padY + (1 - (p - min) / span) * (height - padY * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

type ChartProps = {
  data: PricePoint[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  strokeWidth?: number;
};

// Custom SVG line chart — no external charting library. Used both as a
// tiny sparkline and as the full period chart on the wallet screen.
export function PriceChart({
  data,
  width = 320,
  height = 120,
  color = colors.accentViolet,
  showArea = true,
  strokeWidth = 2.5,
}: ChartProps) {
  const prices = data.map((d) => d.price);
  const { line, area } = useMemo(() => buildLinePath(prices, width, height), [prices, width, height]);
  const gradId = `pc-${color.replace('#', '')}-${Math.round(width)}-${Math.round(height)}`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {showArea && <Path d={area} fill={`url(#${gradId})`} />}
      <Path d={line} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
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
  return <PriceChart data={data} width={width} height={height} color={color} showArea={false} strokeWidth={1.8} />;
}

export function get24hChange(): { price: number; changePct: number; up: boolean } {
  const last = GLAS_PRICE_HISTORY[GLAS_PRICE_HISTORY.length - 1].price;
  const prev = GLAS_PRICE_HISTORY[GLAS_PRICE_HISTORY.length - 2].price;
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
        <Text style={[styles.label, { color: c.textMuted }]}>$GLAS</Text>
        <Text style={[styles.price, { color: c.text }]}>{formatUsd(price)}</Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeArrow, { color: trendColor }]}>{up ? '▲' : '▼'}</Text>
          <Text style={[styles.change, { color: trendColor }]}>{Math.abs(changePct).toFixed(2)}%</Text>
          <Text style={[styles.changeSub, { color: c.textFaint }]}>24H</Text>
        </View>
      </View>
      {showSparkline && <Sparkline data={GLAS_PRICE_HISTORY.slice(-14)} color={trendColor} />}
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
});
