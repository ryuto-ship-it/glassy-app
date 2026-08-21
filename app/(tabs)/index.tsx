import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiHeroBanner } from '@/components/glass/AiHeroBanner';
import { AppBackground } from '@/components/glass/AppBackground';
import { DropletProgress } from '@/components/glass/DropletProgress';
import { EmptyState } from '@/components/glass/EmptyState';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GradeBadge } from '@/components/glass/GradeBadge';
import { PlaceholderArt } from '@/components/glass/PlaceholderArt';
import { PriceTicker } from '@/components/glass/PriceChart';
import { ProductArt } from '@/components/glass/ProductArt';
import { SkeletonBlock, SkeletonCard } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { colors, fonts, radius, spacing, TAGLINE } from '@/constants/theme';
import { FEATURED_GROUP_BUY, PRODUCTS, USER } from '@/data/mock';
import { formatDateShort } from '@/lib/date';
import { formatGlas, formatSigned, formatUsd } from '@/lib/format';
import { CATEGORY_ICON } from '@/lib/productIcon';
import { useTierStatus } from '@/lib/useTierStatus';
import { useAppStore } from '@/store/useAppStore';
import { useQuizStore } from '@/store/useQuizStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const transactions = useAppStore((s) => s.transactions);
  const hasCompletedQuiz = useQuizStore((s) => s.hasCompletedQuiz);
  const quizResult = useQuizStore((s) => s.result);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const { tier, next, progress, totalGlas, remainingGlas, remainingDelta, price, achievedAt } = useTierStatus();
  const isPrecision = tier.order >= 2;
  const recent = transactions.slice(0, 3);
  const catalog = PRODUCTS.slice(0, 12);
  const topPick = quizResult ? PRODUCTS.find((p) => p.id === quizResult.recommendations[0]?.productId) : undefined;

  return (
    <View style={styles.root}>
      <AppBackground />
      <TabFade>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        {/* header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>GLASSY</Text>
            <Text style={styles.tagline}>{TAGLINE}</Text>
            <Text style={styles.hello}>안녕하세요, {USER.name.split(' ')[0]}님</Text>
            <Text style={styles.valueProp}>여행 중에도 AI가 컨디션을 분석하고, 결제할 때마다 등급이 오르는 K-beauty 멤버십</Text>
          </View>
          <Image source={{ uri: USER.avatar }} style={styles.avatar} />
        </View>

        {/* AI hero banner — the app's flagship feature, highest visual priority */}
        <View style={styles.section}>
          <AiHeroBanner
            hasCompletedQuiz={hasCompletedQuiz}
            topPickLabel={topPick ? `${topPick.brand} ${topPick.name}` : undefined}
            matchScore={quizResult?.recommendations[0]?.score}
            isPrecision={isPrecision}
            onPress={() => router.push('/quiz')}
          />
        </View>

        {/* price ticker */}
        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg}>
            <PriceTicker />
          </GlassSurface>
        </View>

        {loading ? (
          <View style={styles.section}>
            <SkeletonCard />
          </View>
        ) : (
          <View style={styles.section}>
            <GlassSurface elevated padding={spacing.xl} radius={radius.xl}>
              <View style={styles.tierRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierKicker}>내 피부 광채 등급</Text>
                  <Text style={[styles.tierName, { color: tier.accent }]}>{tier.name}</Text>
                  <Text style={styles.tierBalance}>{formatGlas(totalGlas)} GLAS 보유</Text>
                  {next ? (
                    <>
                      <Text style={styles.tierRemaining}>
                        지금 시세({formatUsd(price)} 기준)로는 {next.name}까지 앞으로{' '}
                        {formatGlas(remainingGlas)} GLAS 더 필요해요
                      </Text>
                      <Text style={styles.tierDelta}>어제보다 {formatSigned(remainingDelta)}개</Text>
                    </>
                  ) : (
                    <Text style={styles.tierRemaining}>
                      {tier.name} 등급 달성 · {formatDateShort(achievedAt)} 기준 시세로 승급, 이후 시세와 무관하게
                      등급을 유지해요
                    </Text>
                  )}
                </View>
                <DropletProgress size={96} percent={progress} colors={tier.colors}>
                  <GradeBadge tier={tier.id} size={40} />
                </DropletProgress>
              </View>
            </GlassSurface>
          </View>
        )}

        {/* quick actions */}
        <View style={[styles.section, styles.quickRow]}>
          <QuickAction icon="wallet-outline" label="지갑" onPress={() => router.push('/wallet')} />
          <QuickAction icon="sparkles-outline" label="등급 혜택" onPress={() => router.push('/levels')} />
          <QuickAction icon="bag-handle-outline" label="약국" onPress={() => router.push('/shop')} />
          <QuickAction icon="people-outline" label="커뮤니티" onPress={() => router.push('/community')} />
        </View>

        {/* AI matched products */}
        {hasCompletedQuiz && quizResult && quizResult.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI 매칭 상품</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.xl }}
            >
              {quizResult.recommendations.slice(0, 5).map((rec) => {
                const p = PRODUCTS.find((pp) => pp.id === rec.productId);
                if (!p) return null;
                return (
                  <Pressable key={p.id} onPress={() => router.push('/shop')} style={{ width: 148 }}>
                    <GlassSurface radius={radius.lg} padding={spacing.sm}>
                      <ProductArt seed={p.id} shape={p.shape} style={styles.productImg} />
                      <View style={styles.matchChip}>
                        <Text style={styles.matchChipText}>AI {rec.score}%</Text>
                      </View>
                      <Text style={styles.brandLabel}>{p.brand}</Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {p.name}
                      </Text>
                      <Text style={styles.productPrice}>{formatUsd(p.priceUSD)}</Text>
                    </GlassSurface>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* group buy banner */}
        <View style={styles.section}>
          <Pressable onPress={() => router.push('/shop')}>
            <GlassSurface strong radius={radius.lg} padding={spacing.lg}>
              <View style={styles.groupBuyRow}>
                <PlaceholderArt
                  seed={FEATURED_GROUP_BUY.id}
                  icon={CATEGORY_ICON[FEATURED_GROUP_BUY.category]}
                  iconSize={24}
                  style={[styles.groupBuyImg, { borderRadius: radius.md }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupBuyKicker}>이달의 공동구매 · D-{FEATURED_GROUP_BUY.groupBuy?.endsInDays}</Text>
                  <Text style={styles.groupBuyTitle} numberOfLines={1}>
                    {FEATURED_GROUP_BUY.name}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            100,
                            ((FEATURED_GROUP_BUY.groupBuy?.participants ?? 0) /
                              (FEATURED_GROUP_BUY.groupBuy?.goal ?? 1)) *
                              100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.groupBuySub}>
                    {FEATURED_GROUP_BUY.groupBuy?.participants}/{FEATURED_GROUP_BUY.groupBuy?.goal}명 참여 중 · 추가 {FEATURED_GROUP_BUY.groupBuy?.extraDiscountPct}% 할인
                  </Text>
                </View>
              </View>
            </GlassSurface>
          </Pressable>
        </View>

        {/* recent purchases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 구매 내역</Text>
          {loading ? (
            <View style={{ gap: spacing.sm }}>
              <SkeletonBlock height={58} radius={radius.md} />
              <SkeletonBlock height={58} radius={radius.md} />
            </View>
          ) : recent.length === 0 ? (
            <EmptyState title="아직 구매 내역이 없어요" subtitle="약국 탭에서 첫 구매를 시작해보세요" />
          ) : (
            <GlassSurface radius={radius.lg} padding={0}>
              {recent.map((tx, i) => (
                <View key={tx.id} style={[styles.txRow, i !== recent.length - 1 && styles.txDivider]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.title}
                    </Text>
                    <Text style={styles.txSub}>
                      {tx.subtitle} · {formatDateShort(tx.date)}
                    </Text>
                  </View>
                  <Text style={styles.txAmount}>+{formatGlas(tx.glasDelta)} GLAS</Text>
                </View>
              ))}
            </GlassSurface>
          )}
        </View>

        {/* full catalog grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 제품</Text>
          {loading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((k) => (
                <View key={k} style={styles.gridItem}>
                  <SkeletonCard />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.grid}>
              {catalog.map((p) => {
                const discounted = p.priceUSD * (1 - tier.discountPct / 100);
                return (
                  <Pressable key={p.id} onPress={() => router.push('/shop')} style={styles.gridItem}>
                    <GlassSurface radius={radius.lg} padding={spacing.sm}>
                      <View>
                        <ProductArt seed={p.id} shape={p.shape} style={styles.gridImg} />
                        {p.isRepurchase && (
                          <View style={styles.repurchaseBadge}>
                            <Text style={styles.repurchaseBadgeText}>재구매</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.brandLabel}>{p.brand}</Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {p.name}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={11} color={colors.accentGold} />
                        <Text style={styles.ratingText}>
                          {p.rating} ({p.reviewCount.toLocaleString()})
                        </Text>
                      </View>
                      <View style={styles.priceRow}>
                        {tier.discountPct > 0 && <Text style={styles.priceOriginal}>{formatUsd(p.priceUSD)}</Text>}
                        <Text style={styles.productPrice}>{formatUsd(discounted)}</Text>
                      </View>
                    </GlassSurface>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      </TabFade>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <GlassSurface radius={radius.lg} padding={spacing.md} style={{ alignItems: 'center' }}>
        <Ionicons name={icon} size={20} color={colors.text} />
        <Text style={styles.quickLabel}>{label}</Text>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  brand: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 2, color: colors.textMuted },
  tagline: { fontFamily: fonts.body, fontSize: 10, color: colors.textFaint, marginTop: 1 },
  hello: { fontFamily: fonts.displaySemi, fontSize: 19, color: colors.text, marginTop: 6 },
  valueProp: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: 4, maxWidth: 260, lineHeight: 15 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text, marginBottom: spacing.md },

  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tierKicker: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  tierName: { fontFamily: fonts.display, fontSize: 24, marginTop: 2 },
  tierBalance: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text, marginTop: 6 },
  tierRemaining: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  tierDelta: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textFaint, marginTop: 3 },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  quickAction: { flex: 1 },
  quickLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.text, marginTop: 6 },
  groupBuyRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  groupBuyImg: { width: 64, height: 64, borderRadius: radius.md },
  groupBuyKicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.danger },
  groupBuyTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text, marginTop: 2 },
  groupBuySub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 4 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accentViolet, borderRadius: 3 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  txDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderDim },
  txTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  txSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txAmount: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.success },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%' },
  gridImg: { width: '100%', height: 130, borderRadius: radius.md },
  productImg: { width: '100%', height: 110, borderRadius: radius.md },
  matchChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accentGold,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  matchChipText: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#0B0B0D' },
  repurchaseBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  repurchaseBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.text },
  brandLabel: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, marginTop: 8 },
  productName: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.text, marginTop: 2, minHeight: 32 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  priceOriginal: { fontFamily: fonts.body, fontSize: 10, color: colors.textFaint, textDecorationLine: 'line-through' },
  productPrice: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, marginTop: 4 },
});
