import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/glass/AppBackground';
import { DropletProgress } from '@/components/glass/DropletProgress';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GradeBadge } from '@/components/glass/GradeBadge';
import { PillButton } from '@/components/glass/PillButton';
import { SkeletonBlock } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { Tier, TIERS } from '@/constants/glow';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatDateShort } from '@/lib/date';
import { formatGlas, formatSigned, formatUsd } from '@/lib/format';
import { useTierStatus } from '@/lib/useTierStatus';
import { useUiStore } from '@/store/useUiStore';

const CARD_WIDTH = 172;
const CARD_GAP = spacing.md;
const SNAP = CARD_WIDTH + CARD_GAP;

export default function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const openPayment = useUiStore((s) => s.openPayment);

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

  const costUsd = remainingGlas * price;
  const currentIndex = currentTier.order;
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const progressPct = Math.round(progress * 100);

  const onCarouselMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
    setActiveIndex(Math.max(0, Math.min(TIERS.length - 1, idx)));
  };

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
            등급은 보유 GLAS의 달러 가치(개수 × 시세)로 승급돼요. 한번 오른 등급은 시세가 내려가도 강등되지
            않아요.
          </Text>
        </View>

        {/* SaaS-style tier comparison — horizontal snap carousel */}
        <View style={{ marginTop: spacing.lg }}>
          <FlatList
            data={TIERS}
            keyExtractor={(tier) => tier.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP}
            decelerationRate="fast"
            snapToAlignment="start"
            contentContainerStyle={{ paddingHorizontal: spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            getItemLayout={(_, i) => ({ length: SNAP, offset: i * SNAP, index: i })}
            initialScrollIndex={currentIndex}
            onMomentumScrollEnd={onCarouselMomentumEnd}
            renderItem={({ item: tier }: { item: Tier }) => {
              const achieved = tier.order <= currentTier.order;
              const isCurrent = tier.id === currentTier.id;
              return (
                <GlassSurface
                  radius={radius.lg}
                  padding={spacing.lg}
                  strong={isCurrent}
                  elevated={isCurrent}
                  style={[styles.compareCard, isCurrent && { borderColor: tier.accent }]}
                >
                  {isCurrent && (
                    <View style={[styles.achievedChip, { backgroundColor: tier.accent }]}>
                      <Ionicons name="checkmark" size={10} color="#0B0B0D" />
                      <Text style={styles.achievedChipText}>달성됨</Text>
                    </View>
                  )}
                  {!achieved && (
                    <View style={styles.lockChip}>
                      <Ionicons name="lock-closed-outline" size={10} color={colors.textFaint} />
                    </View>
                  )}
                  <GradeBadge tier={tier.id} size={40} />
                  <Text style={[styles.compareName, { color: tier.accent }]}>{tier.name}</Text>
                  <Text style={styles.compareThreshold}>
                    {tier.usdMax ? `$${tier.usdMin.toLocaleString()}+ 상당` : `$${tier.usdMin.toLocaleString()}+ 상당`}
                  </Text>
                  <View style={styles.compareDivider} />
                  <Text style={styles.compareDiscountNum}>{tier.discountPct}%</Text>
                  <Text style={styles.compareDiscountLabel}>상시 할인</Text>
                  <View style={styles.compareBenefits}>
                    {tier.benefits.map((b) => (
                      <View key={b} style={styles.compareBenefitRow}>
                        <Ionicons name="checkmark" size={11} color={tier.accent} />
                        <Text style={styles.compareBenefitText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </GlassSurface>
              );
            }}
          />
          <View style={styles.dotsRow}>
            {TIERS.map((tier, i) => (
              <View key={tier.id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* progress bar tied to the carousel above — how close to the next tier */}
        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg}>
            {next ? (
              <>
                <View style={styles.miniProgressHeaderRow}>
                  <Text style={styles.miniProgressLabel}>
                    {next.name}까지 {formatGlas(remainingGlas)} GLAS 남음
                  </Text>
                  <Text style={[styles.miniProgressPct, { color: next.accent }]}>{progressPct}%</Text>
                </View>
                <View style={styles.miniProgressTrack}>
                  <View style={[styles.miniProgressFill, { width: `${progressPct}%`, backgroundColor: next.accent }]} />
                </View>
              </>
            ) : (
              <Text style={styles.miniProgressLabel}>🎉 최고 등급 달성 — 더 이상 오를 등급이 없어요</Text>
            )}
          </GlassSurface>
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
                  <PillButton
                    label="지금 바로 구매"
                    onPress={() =>
                      openPayment({ kind: 'tier', tierName: next.name, usdCost: costUsd, glasAmount: remainingGlas })
                    }
                    colors_={['#E8C468', '#C79A3D']}
                    icon={<Ionicons name="flash" size={14} color="#0B0B0D" />}
                    style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
                  />
                </>
              ) : (
                <Text style={styles.currentRemaining}>
                  {currentTier.name} 등급 달성 · {formatDateShort(achievedAt)} 기준 시세로 승급, 이후 시세와
                  무관하게 등급을 유지해요
                </Text>
              )}
            </GlassSurface>
          </View>
        )}

        <View style={styles.section}>
          <Pressable onPress={() => router.push('/quiz')}>
            <GlassSurface radius={radius.lg} padding={spacing.lg} style={styles.aiLinkCard}>
              <View style={styles.aiLinkRow}>
                <Ionicons name="sparkles" size={16} color={colors.accentGold} />
                <Text style={styles.aiLinkTitle}>등급이 오르면 AI도 똑똑해져요</Text>
              </View>
              <Text style={styles.aiLinkBody}>
                Radiant Glass 등급부터 AI 헬스 인텔리전스 정밀 분석(5축 리포트 + 상세 코멘터리)이 잠금 해제돼요.
              </Text>
              <Text style={styles.aiLinkCta}>AI 진단 받아보기 →</Text>
            </GlassSurface>
          </Pressable>
        </View>

        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg}>
            <Text style={styles.pathTitle}>등급을 올리는 3가지 방법</Text>
            <View style={styles.pathRow}>
              <Ionicons name="bag-handle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.pathText}>① 제휴 약국에서 스테이블코인 결제 시 즉시 GLAS 적립</Text>
            </View>
            <View style={styles.pathRow}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={styles.pathText}>② 거래소에서 GLAS 매수 후 최소 30일 스테이킹 예치</Text>
            </View>
            <View style={styles.pathRow}>
              <Ionicons name="flash" size={16} color={colors.accentGold} />
              <Text style={styles.pathText}>③ '지금 바로 구매'로 락업 없이 즉시 다음 등급 달성</Text>
            </View>
            <View style={styles.pathRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
              <Text style={styles.pathText}>달성한 등급은 이후 시세가 내려가도 영구적으로 유지돼요</Text>
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
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 18 },

  compareCard: { width: 172, position: 'relative' },
  achievedChip: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  achievedChipText: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#0B0B0D' },
  lockChip: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareName: { fontFamily: fonts.displaySemi, fontSize: 15, marginTop: spacing.sm },
  compareThreshold: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  compareDivider: { height: 1, backgroundColor: colors.borderDim, marginVertical: spacing.md },
  compareDiscountNum: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  compareDiscountLabel: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, marginTop: -2 },
  compareBenefits: { marginTop: spacing.md, gap: 6 },
  compareBenefitRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-start' },
  compareBenefitText: { fontFamily: fonts.bodyMed, fontSize: 10.5, color: colors.textMuted, flex: 1, lineHeight: 14 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotActive: { width: 16, backgroundColor: colors.accentViolet },

  miniProgressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniProgressLabel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.text },
  miniProgressPct: { fontFamily: fonts.displaySemi, fontSize: 13 },
  miniProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  miniProgressFill: { height: '100%', borderRadius: 4 },

  currentName: { fontFamily: fonts.display, fontSize: 22, marginTop: spacing.md },
  currentCount: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginTop: 4 },
  currentRemaining: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  currentDelta: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textFaint, marginTop: 3 },
  aiLinkCard: { borderColor: 'rgba(232,196,104,0.25)' },
  aiLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiLinkTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  aiLinkBody: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6, lineHeight: 16 },
  aiLinkCta: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.accentGold, marginTop: spacing.sm },
  pathTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  pathRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8 },
  pathText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.text, flex: 1 },
});
