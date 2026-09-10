import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { AppBackground } from '@/components/glass/AppBackground';
import { CharmacistLogo } from '@/components/glass/CharmacistLogo';
import { EmptyState } from '@/components/glass/EmptyState';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { ProductImage } from '@/components/glass/ProductImage';
import { SkeletonCard } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { CATEGORY_LABEL, Product, ProductCategory, PRODUCTS, REAL_PRODUCT_BADGE } from '@/data/mock';
import { hashSeed } from '@/lib/artSeed';
import { formatUsd } from '@/lib/format';
import { staggerEnter } from '@/lib/motion';
import { useTierStatus } from '@/lib/useTierStatus';
import { useUiStore } from '@/store/useUiStore';

type FilterKey = 'all' | 'repurchase' | 'groupbuy' | ProductCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'repurchase', label: '재구매' },
  { key: 'groupbuy', label: '공동구매' },
  { key: 'skincare', label: CATEGORY_LABEL.skincare },
  { key: 'vitamin', label: CATEGORY_LABEL.vitamin },
  { key: 'supplement', label: CATEGORY_LABEL.supplement },
  { key: 'ampoule', label: CATEGORY_LABEL.ampoule },
];

// Deterministic (id-seeded) "N명 최근 구매" / "재고 임박" trust signals —
// stable across re-renders, not tied to any real inventory data.
function recentBuyerCount(id: string): number {
  return 8 + (hashSeed(`${id}-buyers`) % 40);
}
function isLowStock(id: string): boolean {
  return hashSeed(`${id}-stock`) % 5 === 0;
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [justBought, setJustBought] = useState<string | null>(null);

  const { tier } = useTierStatus();
  const openPayment = useUiStore((s) => s.openPayment);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = useMemo(() => {
    switch (filter) {
      case 'all':
        return PRODUCTS;
      case 'repurchase':
        return PRODUCTS.filter((p) => p.isRepurchase);
      case 'groupbuy':
        return PRODUCTS.filter((p) => p.groupBuy);
      default:
        return PRODUCTS.filter((p) => p.category === filter);
    }
  }, [filter]);

  const handleBuy = (p: Product, price: number) => {
    openPayment(
      { kind: 'product', title: p.name, subtitle: '참약사 명동점', priceUSD: price },
      () => {
        setJustBought(p.id);
        setTimeout(() => setJustBought(null), 1600);
      }
    );
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
          <Text style={styles.pageTitle}>약국</Text>
          <Text style={styles.pageSub}>
            {tier.name} 등급 · 전 상품 {tier.discountPct}% 자동 할인 적용 중
          </Text>
          <View style={styles.partnerBadge}>
            <CharmacistLogo size={16} />
            <Text style={styles.partnerBadgeText}>참약사 제휴 매장</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.lg }}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.section}>
          {loading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((k) => (
                <View key={k} style={styles.gridItem}>
                  <SkeletonCard />
                </View>
              ))}
            </View>
          ) : filtered.length === 0 ? (
            <EmptyState title="상품이 없어요" subtitle="다른 카테고리를 선택해보세요" />
          ) : (
            <View style={styles.grid}>
              {filtered.map((p, index) => {
                const discounted = p.priceUSD * (1 - tier.discountPct / 100);
                const groupPrice = p.groupBuy
                  ? discounted * (1 - p.groupBuy.extraDiscountPct / 100)
                  : discounted;
                return (
                  <Animated.View
                    key={p.id}
                    entering={staggerEnter(index, { step: 45, max: 360 }, reducedMotion)}
                    style={styles.gridItem}
                  >
                    <GlassSurface radius={radius.lg} padding={spacing.sm}>
                      <View style={styles.imgWrap}>
                        <ProductImage product={p} style={styles.productImg} />
                        {p.isRepurchase && (
                          <View style={styles.repurchaseBadge}>
                            <Text style={styles.repurchaseBadgeText}>재구매</Text>
                          </View>
                        )}
                        {p.isRealProduct && (
                          <View style={styles.realBadge}>
                            <Ionicons name="shield-checkmark" size={9} color="#0B0B0D" />
                            <Text style={styles.realBadgeText}>{REAL_PRODUCT_BADGE}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.brand}>{p.brand}</Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {p.name}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={11} color="#E8C468" />
                        <Text style={styles.ratingText}>
                          {p.rating} ({p.reviewCount.toLocaleString()})
                        </Text>
                      </View>
                      {!p.groupBuy && (
                        <Text style={isLowStock(p.id) ? styles.stockLow : styles.trustText}>
                          {isLowStock(p.id)
                            ? `재고 임박 · 최근 24시간 ${recentBuyerCount(p.id)}명 구매`
                            : `최근 24시간 ${recentBuyerCount(p.id)}명 구매`}
                        </Text>
                      )}

                      {p.groupBuy && (
                        <View style={styles.groupBuyBox}>
                          <Text style={styles.groupBuyText}>
                            공동구매 D-{p.groupBuy.endsInDays} · {p.groupBuy.participants}/{p.groupBuy.goal}명
                          </Text>
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${Math.min(100, (p.groupBuy.participants / p.groupBuy.goal) * 100)}%` },
                              ]}
                            />
                          </View>
                        </View>
                      )}

                      <View style={styles.priceRow}>
                        {tier.discountPct > 0 || p.groupBuy ? (
                          <Text style={styles.priceOriginal}>{formatUsd(p.priceUSD)}</Text>
                        ) : null}
                        <Text style={styles.priceFinal}>{formatUsd(p.groupBuy ? groupPrice : discounted)}</Text>
                      </View>

                      <Pressable
                        onPress={() => handleBuy(p, p.groupBuy ? groupPrice : discounted)}
                        style={({ pressed }) => [
                          styles.buyBtn,
                          justBought === p.id && styles.buyBtnDone,
                          pressed && styles.buyBtnPressed,
                        ]}
                      >
                        <Text style={styles.buyBtnText}>
                          {justBought === p.id ? '적립 완료 ✓' : '구매하기'}
                        </Text>
                      </Pressable>
                    </GlassSurface>
                  </Animated.View>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  pageTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerBadgeText: { fontFamily: fonts.bodySemi, fontSize: 10.5, color: colors.text },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  chipActive: { backgroundColor: colors.accentBlue, borderColor: colors.accentBlue },
  chipPressed: { opacity: 0.75 },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.textMuted },
  chipTextActive: { color: '#0B0B0D' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%' },
  imgWrap: { position: 'relative' },
  productImg: { width: '100%', height: 120, borderRadius: radius.md },
  repurchaseBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  repurchaseBadgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.text },
  realBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.accentGold,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    maxWidth: '80%',
  },
  realBadgeText: { fontFamily: fonts.bodyBold, fontSize: 8, color: '#0B0B0D' },
  brand: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, marginTop: 8 },
  productName: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.text, marginTop: 2, minHeight: 32 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },
  trustText: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textFaint, marginTop: 3 },
  stockLow: { fontFamily: fonts.bodyMed, fontSize: 9.5, color: colors.danger, marginTop: 3 },
  groupBuyBox: { marginTop: spacing.sm },
  groupBuyText: { fontFamily: fonts.bodyMed, fontSize: 9, color: colors.danger },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.danger, borderRadius: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: spacing.sm },
  priceOriginal: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, textDecorationLine: 'line-through' },
  priceFinal: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  buyBtn: {
    marginTop: spacing.sm,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
  },
  buyBtnDone: { backgroundColor: colors.success },
  buyBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buyBtnText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#0B0B0D' },
});
