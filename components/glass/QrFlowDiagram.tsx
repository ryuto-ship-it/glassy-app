import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

// Only ever rendered on the Wallet tab, which stays dark — see
// constants/theme.ts / themeScope.tsx.
import { darkColors as colors, fonts, radius, spacing } from '@/constants/theme';
import { GlassSurface } from './GlassSurface';

function FlowIcon({ icon, label, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; tint: string }) {
  return (
    <View style={styles.iconCol}>
      <View style={[styles.iconCircle, { backgroundColor: `${tint}1F`, borderColor: `${tint}55` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.iconLabel}>{label}</Text>
    </View>
  );
}

function Arrow() {
  return <Ionicons name="arrow-forward" size={14} color={colors.textFaint} style={{ marginTop: -14 }} />;
}

// The core onboarding idea from task 1: payment method is irrelevant, only
// the QR at checkout matters for earning GLAS. Shown as a small explainer
// card in the Wallet tab (rather than a one-time gate) so it's always
// reachable for demo purposes.
export function QrFlowDiagram() {
  return (
    <GlassSurface radius={radius.lg} padding={spacing.lg}>
      <View style={styles.headerRow}>
        <Ionicons name="qr-code" size={15} color={colors.accentGold} />
        <Text style={styles.title}>결제는 무엇으로 하든, 적립은 QR로</Text>
      </View>
      <Text style={styles.body}>현금·카드·스테이블코인 중 무엇으로 결제하든 상관없어요. 계산대의 QR만 있으면 자동으로 GLAS가 적립돼요.</Text>

      <View style={styles.row}>
        <FlowIcon icon="cash-outline" label="현금" tint={colors.textMuted} />
        <FlowIcon icon="card-outline" label="카드" tint={colors.textMuted} />
        <FlowIcon icon="swap-horizontal-outline" label="스테이블코인" tint={colors.textMuted} />
        <Arrow />
        <FlowIcon icon="qr-code-outline" label="QR 스캔" tint={colors.accentGold} />
        <Arrow />
        <FlowIcon icon="flash" label="GLAS 지급" tint={colors.accentViolet} />
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.displaySemi, fontSize: 13.5, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6, lineHeight: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    flexWrap: 'wrap',
    gap: 6,
  },
  iconCol: { alignItems: 'center', width: 46 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: { fontFamily: fonts.bodyMed, fontSize: 8.5, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
});
