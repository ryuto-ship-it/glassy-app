import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/glass/AppBackground';
import { DropletProgress } from '@/components/glass/DropletProgress';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GradeBadge } from '@/components/glass/GradeBadge';
import { SkeletonBlock } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { TIERS } from '@/constants/glow';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatDateShort } from '@/lib/date';
import { formatGlas, formatSigned, formatUsd } from '@/lib/format';
import { useTierStatus } from '@/lib/useTierStatus';

export default function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const {
    tier: currentTier,
    next,
    progress,
    totalGlas,
    remainingGlas,
    remainingDelta,
    price,
    achievedAt,
  } = useTierStatus();

  return (
    <View style={styles.root}>
      <AppBackground />
      <TabFade>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
      >
        <View style={styles.section}>
          <Text style={styles.pageTitle}>Glow Levels</Text>
          <Text style={styles.pageSub}>
            등급은 보유 GLAS의 달러 가치(개수 × 시세)로 승급돼요 — 한번 오르면 시세가 내려가도 강등되지 않아요.
          </Text>
        </View>

        {loading ? (
          <View style={styles.section}>
            <SkeletonBlock height={180} radius={radius.xl} />
          </View>
        ) : (
          <View style={styles.section}>
            <GlassSurface elevated radius={radius.xl} padding={spacing.xl} style={{ alignItems: 'center' }}>
              <DropletProgress size={140} percent={progress} colors={currentTier.colors}>
                <GradeBadge tier={currentTier.id} size={56} />
              </DropletProgress>
              <Text style={[styles.currentName, { color: currentTier.accent }]}>{currentTier.name}</Text>
              <Text style={styles.currentCount}>{formatGlas(totalGlas)} GLAS 보유 중</Text>
              {next ? (
                <>
                  <Text style={styles.currentRemaining}>
                    지금 시세({formatUsd(price)} 기준)로는 {next.name}까지 앞으로{' '}
                    {formatGlas(remainingGlas)} GLAS 더 필요해요
                  </Text>
                  <Text style={styles.currentDelta}>어제보다 {formatSigned(remainingDelta)}개</Text>
                </>
              ) : (
                <Text style={styles.currentRemaining}>
                  {currentTier.name} 등급 달성! ({formatDateShort(achievedAt)} 기준 시세로 승급, 이후 시세와
                  무관하게 등급 유지)
                </Text>
              )}
            </GlassSurface>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4단계 광채 로드맵</Text>
          <View style={styles.roadmap}>
            {TIERS.map((tier, i) => {
              const achieved = tier.order <= currentTier.order;
              const isCurrent = tier.id === currentTier.id;
              const isNext = next?.id === tier.id;
              return (
                <View key={tier.id} style={styles.roadmapRow}>
                  <View style={styles.roadmapRail}>
                    <View
                      style={[
                        styles.railDot,
                        { backgroundColor: achieved ? tier.accent : 'rgba(74,46,78,0.15)' },
                        isCurrent && styles.railDotCurrent,
                      ]}
                    />
                    {i !== TIERS.length - 1 && (
                      <View
                        style={[
                          styles.railLine,
                          { backgroundColor: achieved ? tier.accent : 'rgba(74,46,78,0.12)' },
                        ]}
                      />
                    )}
                  </View>

                  <GlassSurface
                    radius={radius.lg}
                    padding={spacing.lg}
                    strong={isCurrent}
                    style={[styles.roadmapCard, !achieved && !isNext && styles.roadmapCardDim]}
                  >
                    <View style={styles.roadmapHeader}>
                      <GradeBadge tier={tier.id} size={36} />
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <View style={styles.roadmapTitleRow}>
                          <Text style={[styles.roadmapName, { color: tier.accent }]}>{tier.name}</Text>
                          {isCurrent && (
                            <View style={styles.currentChip}>
                              <Text style={styles.currentChipText}>현재 위치</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.roadmapRange}>
                          {tier.usdMax
                            ? `$${tier.usdMin.toLocaleString()}–$${Math.floor(tier.usdMax).toLocaleString()} 상당 보유`
                            : `$${tier.usdMin.toLocaleString()}+ 상당 보유`}
                        </Text>
                      </View>
                      {!achieved && (
                        <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.roadmapTagline}>{tier.tagline}</Text>
                    <View style={styles.benefitList}>
                      {tier.benefits.map((b) => (
                        <View key={b} style={styles.benefitRow}>
                          <Text style={[styles.benefitDot, { color: tier.accent }]}>✦</Text>
                          <Text style={styles.benefitText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.discountChip}>
                      <Text style={styles.discountChipText}>상시 {tier.discountPct}% 할인</Text>
                    </View>
                  </GlassSurface>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg}>
            <Text style={styles.pathTitle}>등급을 올리는 2가지 방법</Text>
            <View style={styles.pathRow}>
              <Ionicons name="bag-handle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.pathText}>① 제휴 약국에서 스테이블코인 결제 시 즉시 GLAS 적립</Text>
            </View>
            <View style={styles.pathRow}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={styles.pathText}>② 거래소에서 GLAS 매수 후 최소 30일 스테이킹 예치</Text>
            </View>
            <View style={styles.pathRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
              <Text style={styles.pathText}>③ 달성한 등급은 이후 시세가 내려가도 영구적으로 유지돼요</Text>
            </View>
          </GlassSurface>
        </View>
      </ScrollView>
      </TabFade>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  pageTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  currentName: { fontFamily: fonts.display, fontSize: 22, marginTop: spacing.md },
  currentCount: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginTop: 4 },
  currentRemaining: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  currentDelta: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, marginTop: 3, opacity: 0.8 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text, marginBottom: spacing.md },
  roadmap: {},
  roadmapRow: { flexDirection: 'row', gap: spacing.sm },
  roadmapRail: { width: 20, alignItems: 'center' },
  railDot: { width: 14, height: 14, borderRadius: 7, marginTop: 6 },
  railDotCurrent: { width: 18, height: 18, borderRadius: 9, marginTop: 4 },
  railLine: { width: 3, flex: 1, marginTop: 2, marginBottom: 2, minHeight: 40 },
  roadmapCard: { flex: 1, marginBottom: spacing.lg },
  roadmapCardDim: { opacity: 0.55 },
  roadmapHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  roadmapTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roadmapName: { fontFamily: fonts.displaySemi, fontSize: 16 },
  currentChip: { backgroundColor: colors.text, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  currentChipText: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#fff' },
  roadmapRange: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  roadmapTagline: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  benefitList: { marginTop: spacing.md, gap: 6 },
  benefitRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  benefitDot: { fontSize: 11, marginTop: 1 },
  benefitText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.text, flex: 1 },
  discountChip: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,46,78,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  discountChipText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text },
  pathTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  pathRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8 },
  pathText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.text, flex: 1 },
});
