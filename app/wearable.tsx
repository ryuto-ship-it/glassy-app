import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { MiniTrendLine } from '@/components/glass/AdminCharts';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PillButton } from '@/components/glass/PillButton';
import { ProductArt } from '@/components/glass/ProductArt';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getProductById, useAppStore } from '@/store/useAppStore';
import { getWearableInsight, recoveryLabel, RECOVERY_SCORE_TODAY, WEARABLE_VITALS } from '@/data/wearable';
import { formatUsd } from '@/lib/format';
import { useUiStore } from '@/store/useUiStore';

const RING_SIZE = 132;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const PROVIDERS: { id: 'whoop' | 'apple-watch' | 'fitbit'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'whoop', label: 'Whoop', icon: 'fitness' },
  { id: 'apple-watch', label: 'Apple Watch', icon: 'watch' },
  { id: 'fitbit', label: 'Fitbit', icon: 'pulse' },
];

export default function WearableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const wearableProvider = useAppStore((s) => s.wearableProvider);
  const connectWearable = useAppStore((s) => s.connectWearable);
  const openPayment = useUiStore((s) => s.openPayment);
  const [connecting, setConnecting] = useState<'whoop' | 'apple-watch' | 'fitbit' | null>(null);

  const startConnect = (provider: 'whoop' | 'apple-watch' | 'fitbit') => {
    setConnecting(provider);
    setTimeout(() => {
      connectWearable(provider);
      setConnecting(null);
    }, 1400);
  };

  const connected = !!wearableProvider;
  const today = WEARABLE_VITALS[WEARABLE_VITALS.length - 1];
  const insight = getWearableInsight(WEARABLE_VITALS);
  const recProducts = insight.productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const bundlePrice = recProducts.reduce((sum, p) => sum + p.priceUSD, 0);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 100 }}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.pageTitle}>내 컨디션</Text>
          </View>
        </View>

        {!connected ? (
          <>
            <View style={styles.section}>
              <GlassSurface radius={radius.lg} padding={spacing.lg}>
                <Text style={styles.connectTitle}>웨어러블 연동</Text>
                <Text style={styles.connectSub}>연동하면 실시간 바이탈 데이터로 더 정밀한 분석을 받아볼 수 있어요.</Text>
                <View style={styles.providerRow}>
                  {PROVIDERS.map((p) => (
                    <Pressable key={p.id} onPress={() => startConnect(p.id)} style={styles.providerBtn} disabled={!!connecting}>
                      {connecting === p.id ? (
                        <ActivityIndicator color={colors.accentViolet} size="small" />
                      ) : (
                        <Ionicons name={p.icon} size={20} color={colors.accentViolet} />
                      )}
                      <Text style={styles.providerLabel}>{connecting === p.id ? '연동 중...' : p.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </GlassSurface>
            </View>

            <View style={styles.section}>
              <GlassSurface radius={radius.lg} padding={spacing.lg}>
                <View style={styles.surveyRow}>
                  <Ionicons name="clipboard-outline" size={16} color={colors.accentGold} />
                  <Text style={styles.surveyTitle}>AI 컨디션 설문하기</Text>
                </View>
                <Text style={styles.surveySub}>웨어러블 없이도 간단한 체크리스트로 AI 진단을 받아볼 수 있어요.</Text>
                <PillButton label="설문 시작하기" onPress={() => router.push('/quiz')} style={{ marginTop: spacing.md }} />
              </GlassSurface>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <GlassSurface elevated radius={radius.xl} padding={spacing.xl} style={{ alignItems: 'center' }}>
                <View style={styles.gaugeWrap}>
                  <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke={colors.borderDim} strokeWidth={RING_STROKE} fill="none" />
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      stroke={colors.accentViolet}
                      strokeWidth={RING_STROKE}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${RING_CIRC}, ${RING_CIRC}`}
                      strokeDashoffset={RING_CIRC * (1 - RECOVERY_SCORE_TODAY / 100)}
                      transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                    />
                  </Svg>
                  <View style={styles.gaugeCenter}>
                    <Text style={styles.gaugeValue}>{RECOVERY_SCORE_TODAY}%</Text>
                    <Text style={styles.gaugeLabel}>{recoveryLabel(RECOVERY_SCORE_TODAY)}</Text>
                  </View>
                </View>
                <Text style={styles.gaugeCaption}>오늘의 회복 점수</Text>
                <View style={styles.syncRow}>
                  <Ionicons name="sync" size={11} color={colors.textFaint} />
                  <Text style={styles.syncText}>마지막 동기화: 3분 전 · {PROVIDERS.find((p) => p.id === wearableProvider)?.label}</Text>
                </View>
              </GlassSurface>
            </View>

            <View style={[styles.section, styles.metricGrid]}>
              <MetricCard
                label="심박수"
                value={`${today.heartRateAvg} bpm`}
                sub={`최고 ${today.heartRateMax} · 최저 ${today.heartRateMin}`}
                points={WEARABLE_VITALS.map((v) => v.heartRateAvg)}
                color={colors.accentViolet}
              />
              <MetricCard
                label="수면"
                value={`${today.sleepHours.toFixed(1)}시간`}
                sub={`깊은잠 ${today.sleepDeepPct}% · 렘 ${today.sleepRemPct}%`}
                points={WEARABLE_VITALS.map((v) => v.sleepHours)}
                color={colors.accentTeal}
              />
              <MetricCard
                label="산소포화도"
                value={`${today.spo2}%`}
                sub="SpO2"
                points={WEARABLE_VITALS.map((v) => v.spo2)}
                color={colors.accentGold}
              />
              <MetricCard
                label="스트레스"
                value={`${today.stressLevel}`}
                sub="0~100 스케일"
                points={WEARABLE_VITALS.map((v) => v.stressLevel)}
                color={colors.danger}
              />
            </View>

            <View style={styles.section}>
              <GlassSurface radius={radius.lg} padding={spacing.lg}>
                <View style={styles.aiRow}>
                  <Ionicons name="sparkles" size={14} color={colors.accentGold} />
                  <Text style={styles.aiTitle}>AI 해석</Text>
                </View>
                <Text style={styles.aiComment}>{insight.comment}</Text>
              </GlassSurface>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이런 상태엔 이 제품이 도움이 될 수 있어요</Text>
              <View style={{ gap: spacing.md }}>
                {recProducts.map((p) => (
                  <GlassSurface key={p.id} radius={radius.lg} padding={spacing.md}>
                    <View style={styles.recRow}>
                      <ProductArt seed={p.id} shape={p.shape} style={styles.recImg} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recBrand}>{p.brand}</Text>
                        <Text style={styles.recName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.recPrice}>{formatUsd(p.priceUSD)}</Text>
                      </View>
                    </View>
                    <View style={styles.reasonRow}>
                      <Ionicons name="sparkles" size={11} color={colors.accentGold} />
                      <Text style={styles.reasonText}>{insight.reasons[p.id] ?? 'AI가 종합 분석해 추천드려요.'}</Text>
                    </View>
                  </GlassSurface>
                ))}
              </View>

              <PillButton
                label={`지금 담기 · ${formatUsd(bundlePrice)}`}
                onPress={() =>
                  openPayment({ kind: 'product', title: `내 컨디션 추천 제품 ${recProducts.length}건`, subtitle: '웨어러블 연동 분석', priceUSD: bundlePrice })
                }
                colors_={['#B18CFF', '#8C5CE0']}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          </>
        )}

        <Text style={styles.disclaimer}>이 분석은 참고용이며 의학적 진단이 아닙니다.</Text>
      </ScrollView>
    </View>
  );
}

function MetricCard({
  label,
  value,
  sub,
  points,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  points: number[];
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <GlassSurface radius={radius.lg} padding={spacing.md}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricSub}>{sub}</Text>
        <View style={{ marginTop: spacing.sm }}>
          <MiniTrendLine points={points} color={color} width={140} height={32} />
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  connectTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.text },
  connectSub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.textMuted, marginTop: 6, lineHeight: 16 },
  providerRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  providerBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerLabel: { fontFamily: fonts.bodySemi, fontSize: 10.5, color: colors.text },
  surveyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  surveyTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  surveySub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.textMuted, marginTop: 6, lineHeight: 16 },
  gaugeWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { fontFamily: fonts.display, fontSize: 28, color: colors.accentViolet },
  gaugeLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  gaugeCaption: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.text, marginTop: spacing.md },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  syncText: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textFaint },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: { width: '47%' },
  metricLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted },
  metricValue: { fontFamily: fonts.display, fontSize: 18, color: colors.text, marginTop: 4 },
  metricSub: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textFaint, marginTop: 2 },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle: { fontFamily: fonts.displaySemi, fontSize: 13.5, color: colors.text },
  aiComment: { fontFamily: fonts.body, fontSize: 12.5, color: colors.text, marginTop: spacing.sm, lineHeight: 18 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text, marginBottom: spacing.md },
  recRow: { flexDirection: 'row', gap: spacing.sm },
  recImg: { width: 52, height: 65, borderRadius: radius.sm },
  recBrand: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted },
  recName: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginTop: 2 },
  recPrice: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text, marginTop: 4 },
  reasonRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-start', marginTop: spacing.sm },
  reasonText: { flex: 1, fontFamily: fonts.body, fontSize: 10.5, color: colors.textMuted, lineHeight: 14 },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});
