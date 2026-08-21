import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChartLegend,
  DonutChart,
  GroupedBarChart,
  KpiCard,
  MiniTrendLine,
  SimpleBarChart,
} from '@/components/glass/AdminCharts';
import { GlassSurface } from '@/components/glass/GlassSurface';
// The admin dashboard is always dark — a deliberate contrast with the
// light consumer app. See constants/theme.ts / themeScope.tsx.
import { darkColors as colors, fonts, radius, spacing } from '@/constants/theme';
import { DarkScope } from '@/constants/themeScope';
import { ADMIN_ANALYTICS } from '@/data/mock';

const a = ADMIN_ANALYTICS;

// The store-owner-facing admin dashboard — a deliberately different visual
// register (data-viz first) from the consumer app, entered only via
// Profile's small "매장 관리자 뷰" link so it reads as a distinct persona
// switch, not a hidden tab.
export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <DarkScope>
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 100 }}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>GLASSY FOR BUSINESS</Text>
              <Text style={styles.title}>매장 관리자 대시보드</Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.exitBtn}>
              <Ionicons name="person-outline" size={13} color={colors.text} />
              <Text style={styles.exitBtnText}>유저 앱으로</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg} style={styles.pitchBanner}>
            <Ionicons name="sparkles" size={14} color={colors.accentGold} />
            <Text style={styles.pitchText}>카드사도, 어떤 브랜드도 가질 수 없는 오프라인 고객 데이터입니다.</Text>
          </GlassSurface>
        </View>

        <View style={[styles.section, styles.kpiGrid]}>
          <KpiCard label="총 가입 유저 수" value={a.totalUsers.toLocaleString()} sub="+8.2% MoM" />
          <KpiCard label="이번달 방문객 수" value={a.monthlyVisitors.toLocaleString()} sub="+12.4% MoM" />
          <KpiCard label="평균 객단가" value={`$${a.avgOrderValueUSD.toFixed(2)}`} />
          <KpiCard label="QR 적립 전환율" value={`${a.qrRedemptionRatePct}%`} sub="결제수단 무관 적립" />
        </View>

        <View style={styles.section}>
          <SectionCard title="국가별 방문객 비중">
            <View style={styles.donutRow}>
              <DonutChart data={a.countryShare} size={130} strokeWidth={22} />
              <View style={{ flex: 1 }}>
                <ChartLegend data={a.countryShare} />
              </View>
            </View>
          </SectionCard>
        </View>

        <View style={styles.section}>
          <SectionCard title="연령대 x 성별 구매 비중">
            <GroupedBarChart
              groups={a.ageGenderShare}
              seriesLabels={['남성', '여성']}
              colorA={colors.accentViolet}
              colorB={colors.accentTeal}
            />
          </SectionCard>
        </View>

        <View style={styles.section}>
          <SectionCard title="결제수단별 비중">
            <View style={styles.donutRow}>
              <DonutChart data={a.paymentMethodShare} size={130} strokeWidth={22} />
              <View style={{ flex: 1 }}>
                <ChartLegend data={a.paymentMethodShare} />
              </View>
            </View>
            <View style={styles.trendBlock}>
              <Text style={styles.trendLabel}>스테이블코인 결제 비중 성장 추이 (6개월)</Text>
              <View style={styles.trendRow}>
                <MiniTrendLine points={a.stablecoinTrend} color={colors.accentViolet} width={220} height={44} />
                <Text style={styles.trendNow}>{a.stablecoinTrend[a.stablecoinTrend.length - 1]}%</Text>
              </View>
            </View>
          </SectionCard>
        </View>

        <View style={styles.section}>
          <SectionCard title="인기 카테고리 Top 5">
            <SimpleBarChart data={a.topCategories} />
          </SectionCard>
        </View>

        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg} style={styles.retentionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.retentionLabel}>재방문 고객 비중</Text>
              <Text style={styles.retentionSub}>최초 방문 후 30일 내 재방문한 고객 비율</Text>
            </View>
            <Text style={styles.retentionValue}>{a.returningCustomerPct}%</Text>
          </GlassSurface>
        </View>
      </ScrollView>
    </View>
    </DarkScope>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassSurface radius={radius.lg} padding={spacing.lg}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      <View style={{ marginTop: spacing.md }}>{children}</View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.4, color: colors.accentGold },
  title: { fontFamily: fonts.display, fontSize: 21, color: colors.text, marginTop: 4 },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  exitBtnText: { fontFamily: fonts.bodySemi, fontSize: 10.5, color: colors.text },
  pitchBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(232,196,104,0.08)', borderColor: 'rgba(232,196,104,0.25)', borderWidth: 1 },
  pitchText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.text, lineHeight: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  sectionCardTitle: { fontFamily: fonts.displaySemi, fontSize: 13.5, color: colors.text },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  trendBlock: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderDim },
  trendLabel: { fontFamily: fonts.bodyMed, fontSize: 10.5, color: colors.textMuted, marginBottom: 6 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  trendNow: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.accentViolet },
  retentionCard: { flexDirection: 'row', alignItems: 'center' },
  retentionLabel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.text },
  retentionSub: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textMuted, marginTop: 3, lineHeight: 14 },
  retentionValue: { fontFamily: fonts.display, fontSize: 26, color: colors.accentTeal },
});
