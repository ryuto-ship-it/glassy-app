import { View, Text, StyleSheet } from 'react-native';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, fonts } from '@/constants/theme';
import { TokenomicsSlice } from '@/constants/tokenomics';

// Web-only: recharts renders to the DOM and has no native equivalent, so this
// file is deliberately paired with TokenomicsChart.native.tsx (a plain-text
// stand-in) rather than a shared bare TokenomicsChart.tsx — the Metro
// bundler picks whichever one matches the target platform, so recharts
// never ends up in the native bundle.
export default function TokenomicsChart({ data, size = 200 }: { data: TokenomicsSlice[]; size?: number }) {
  return (
    <View>
      <View style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={size * 0.26}
              outerRadius={size * 0.48}
              paddingAngle={1.5}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [`${v}%`, String(name)] as [string, string]}
              contentStyle={{
                background: colors.surfaceRaised,
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 10,
                fontFamily: fonts.bodyMed,
                fontSize: 12,
              }}
              itemStyle={{ color: colors.text }}
              labelStyle={{ color: colors.text }}
            />
          </PieChart>
        </ResponsiveContainer>
      </View>
      <View style={styles.legend}>
        {data.map((slice) => (
          <View key={slice.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {slice.label}
            </Text>
            <Text style={styles.legendValue}>{slice.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { marginTop: 14, gap: 7 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 11.5, color: colors.text, fontFamily: fonts.bodyMed },
  legendValue: { fontSize: 11.5, color: colors.textMuted, fontFamily: fonts.bodyMed },
});
