import { View, Text, StyleSheet } from 'react-native';
import { darkColors as colors, fonts } from '@/constants/theme';
import { TokenomicsSlice } from '@/constants/tokenomics';

// Never actually reached today (the side link-tree panel that renders this
// only exists on the web desktop layout), but kept as a lightweight fallback
// so this component resolves cleanly if it's ever imported from a native
// screen. See TokenomicsChart.web.tsx for the real recharts implementation.
export default function TokenomicsChart({ data }: { data: TokenomicsSlice[]; size?: number }) {
  return (
    <View>
      {data.map((slice) => (
        <View key={slice.key} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: slice.color }]} />
          <Text style={styles.label}>{slice.label}</Text>
          <Text style={styles.value}>{slice.value}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { flex: 1, fontSize: 11.5, color: colors.text, fontFamily: fonts.bodyMed },
  value: { fontSize: 11.5, color: colors.textMuted, fontFamily: fonts.bodyMed },
});
