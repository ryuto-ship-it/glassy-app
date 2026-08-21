import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/glass/AppBackground';
import { EmptyState } from '@/components/glass/EmptyState';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PillButton } from '@/components/glass/PillButton';
import { get24hChange, PriceChart, PriceTicker } from '@/components/glass/PriceChart';
import { SkeletonBlock } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { RADAR_AXES } from '@/data/aiRecommendations';
import { STAKE_LOCKUP_DAYS } from '@/constants/glow';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { GLAS_PRICE_HISTORY, GLAS_PRICE_HISTORY_24H } from '@/data/mock';
import { addDays, daysSince, daysUntil, formatDateShort } from '@/lib/date';
import { formatGlas, formatUsd } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { useQuizStore } from '@/store/useQuizStore';
import { useUiStore } from '@/store/useUiStore';

type Period = '24H' | '7D' | '30D';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const openWalletAction = useUiStore((s) => s.openWalletAction);
  const [notice, setNotice] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('7D');
  const [chartWidth, setChartWidth] = useState(300);

  const purchaseEarned = useAppStore((s) => s.purchaseEarnedGlas);
  const directPurchase = useAppStore((s) => s.directPurchaseGlas);
  const communityReward = useAppStore((s) => s.communityRewardGlas);
  const liquid = useAppStore((s) => s.liquidBoughtGlas);
  const stakeEntries = useAppStore((s) => s.stakeEntries);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const usdt = useAppStore((s) => s.usdtBalance);
  const usdc = useAppStore((s) => s.usdcBalance);
  const transactions = useAppStore((s) => s.transactions);
  const demoFastForward = useAppStore((s) => s.demoFastForward);
  const totalGlas = useAppStore((s) => s.totalGlas());
  const maturedStaked = useAppStore((s) => s.maturedStakedGlas());
  const pendingStaked = useAppStore((s) => s.pendingStakedGlas());

  const unstakeEntry = useAppStore((s) => s.unstakeEntry);
  const toggleDemoFastForward = useAppStore((s) => s.toggleDemoFastForward);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleUnstake = (entryId: string) => {
    const res = unstakeEntry(entryId);
    setNotice(res.ok ? '언스테이킹이 완료됐어요.' : res.reason ?? null);
    setTimeout(() => setNotice(null), 3200);
  };

  const { up } = get24hChange();
  const trendColor = up ? colors.success : colors.danger;
  const chartData =
    period === '24H' ? GLAS_PRICE_HISTORY_24H : period === '7D' ? GLAS_PRICE_HISTORY.slice(-7) : GLAS_PRICE_HISTORY;

  return (
    <View style={styles.root}>
      <AppBackground />
      <TabFade>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
      >
        <View style={styles.section}>
          <Text style={styles.pageTitle}>지갑</Text>
          <Text style={styles.pageSub}>$GLAS는 결제 수단이 아니라 보유 개수로 등급을 결정해요.</Text>
        </View>

        <View style={styles.section}>
          <DiagnosisHistoryCard />
        </View>

        <View style={styles.section}>
          <GlassSurface elevated radius={radius.xl} padding={spacing.lg}>
            <PriceTicker showSparkline={false} />
            <View
              style={{ height: 140, marginTop: spacing.lg }}
              onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
            >
              <PriceChart data={chartData} width={chartWidth} height={140} color={trendColor} />
            </View>
            <View style={styles.periodRow}>
              {(['24H', '7D', '30D'] as const).map((p) => (
                <Pressable key={p} onPress={() => setPeriod(p)} style={{ flex: 1 }}>
                  <View style={[styles.periodChip, period === p && styles.periodChipActive]}>
                    <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>{p}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </GlassSurface>
        </View>

        {loading ? (
          <View style={styles.section}>
            <SkeletonBlock height={150} radius={radius.xl} />
          </View>
        ) : (
          <View style={styles.section}>
            <GlassSurface elevated radius={radius.xl} padding={spacing.xl}>
              <Text style={styles.glasKicker}>총 보유 GLAS (등급 반영분)</Text>
              <Text style={styles.glasTotal}>{formatGlas(totalGlas)} GLAS</Text>
              <Text style={styles.sourceIntro}>GLAS 출처별로 색과 아이콘이 달라요 — ? 를 눌러 설명을 볼 수 있어요.</Text>

              <View style={styles.sourceGrid}>
                <SourceRow
                  icon="bag-check-outline"
                  color={colors.accentViolet}
                  label="구매 적립분"
                  value={purchaseEarned}
                  tooltip="약국에서 스테이블코인·신용카드로 결제할 때마다 자동으로 적립되는 GLAS예요."
                  isOpen={openTooltip === 'purchase'}
                  onToggle={() => setOpenTooltip(openTooltip === 'purchase' ? null : 'purchase')}
                />
                <SourceRow
                  icon="flash"
                  color={colors.accentGold}
                  label="등급 즉시구매분"
                  value={directPurchase}
                  tooltip="등급 탭에서 '지금 바로 구매'로 결제한 즉시, 락업 없이 등급에 반영되는 GLAS예요."
                  isOpen={openTooltip === 'direct'}
                  onToggle={() => setOpenTooltip(openTooltip === 'direct' ? null : 'direct')}
                />
                <SourceRow
                  icon="people-outline"
                  color={colors.accentTeal}
                  label="커뮤니티 리워드분"
                  value={communityReward}
                  tooltip="Glow Feed에서 후기 작성, 좋아요, 팔로워 증가로 받은 GLAS예요."
                  isOpen={openTooltip === 'community'}
                  onToggle={() => setOpenTooltip(openTooltip === 'community' ? null : 'community')}
                />
                <SourceRow
                  icon="lock-closed-outline"
                  color={colors.textFaint}
                  label="스테이킹 매수분"
                  value={maturedStaked}
                  tooltip="거래소에서 매수한 GLAS를 30일 이상 예치하면 등급에 반영되는 GLAS예요."
                  isOpen={openTooltip === 'staking'}
                  onToggle={() => setOpenTooltip(openTooltip === 'staking' ? null : 'staking')}
                />
              </View>

              {pendingStaked > 0 && (
                <Text style={styles.pendingNote}>
                  락업 중 {formatGlas(pendingStaked)} GLAS — 30일 후 등급에 반영돼요
                </Text>
              )}
              {liquid > 0 && (
                <Text style={styles.pendingNote}>미스테이킹 {formatGlas(liquid)} GLAS 보유 중</Text>
              )}
            </GlassSurface>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.stableRow}>
            <GlassSurface radius={radius.lg} padding={spacing.lg} style={{ flex: 1 }}>
              <Text style={styles.stableLabel}>USDT</Text>
              <Text style={styles.stableValue}>{formatUsd(usdt)}</Text>
            </GlassSurface>
            <GlassSurface radius={radius.lg} padding={spacing.lg} style={{ flex: 1 }}>
              <Text style={styles.stableLabel}>USDC</Text>
              <Text style={styles.stableValue}>{formatUsd(usdc)}</Text>
            </GlassSurface>
          </View>
        </View>

        <View style={[styles.section, styles.actionRow]}>
          <PillButton label="거래소에서 매수" onPress={() => openWalletAction('buy')} style={{ flex: 1 }} />
          <PillButton
            label="스테이킹하기"
            variant="ghost"
            onPress={() => openWalletAction('stake')}
            disabled={liquid <= 0}
            style={{ flex: 1 }}
          />
        </View>

        {notice && (
          <View style={styles.section}>
            <GlassSurface radius={radius.md} padding={spacing.md}>
              <Text style={styles.noticeText}>{notice}</Text>
            </GlassSurface>
          </View>
        )}

        {/* staking entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>스테이킹 현황</Text>
            <Pressable onPress={toggleDemoFastForward} style={styles.demoToggle}>
              <Ionicons name={demoFastForward ? 'flash' : 'flash-outline'} size={13} color={colors.textMuted} />
              <Text style={styles.demoToggleText}>데모: 락업 즉시 해제 {demoFastForward ? 'ON' : 'OFF'}</Text>
            </Pressable>
          </View>
          {stakeEntries.length === 0 ? (
            <EmptyState emoji="🔒" title="스테이킹 중인 GLAS가 없어요" subtitle="거래소 매수 후 스테이킹해보세요" />
          ) : (
            <GlassSurface radius={radius.lg} padding={0}>
              {stakeEntries.map((entry, i) => {
                const unlockDate = addDays(entry.startDate, STAKE_LOCKUP_DAYS);
                const daysLeft = daysUntil(unlockDate);
                const matured = demoFastForward || daysLeft <= 0;
                return (
                  <View key={entry.id} style={[styles.stakeRow, i !== stakeEntries.length - 1 && styles.txDivider]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txTitle}>{formatGlas(entry.amount)} GLAS</Text>
                      <Text style={styles.txSub}>
                        {matured ? '락업 해제됨' : `락업 해제까지 D-${daysLeft}`} · {formatDateShort(entry.startDate)} 예치
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleUnstake(entry.id)}
                      style={[styles.unstakeBtn, !matured && styles.unstakeBtnDisabled]}
                    >
                      <Text style={styles.unstakeBtnText}>언스테이킹</Text>
                    </Pressable>
                  </View>
                );
              })}
            </GlassSurface>
          )}
        </View>

        {/* transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>트랜잭션 히스토리</Text>
          {loading ? (
            <View style={{ gap: spacing.sm }}>
              <SkeletonBlock height={54} radius={radius.md} />
              <SkeletonBlock height={54} radius={radius.md} />
              <SkeletonBlock height={54} radius={radius.md} />
            </View>
          ) : (
            <GlassSurface radius={radius.lg} padding={0}>
              {transactions.slice(0, 12).map((tx, i) => (
                <View key={tx.id} style={[styles.txRow, i !== Math.min(transactions.length, 12) - 1 && styles.txDivider]}>
                  <View style={styles.txIcon}>
                    <Ionicons name={txIcon(tx.type)} size={16} color={colors.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.title}
                    </Text>
                    <Text style={styles.txSub}>{formatDateShort(tx.date)}</Text>
                  </View>
                  <Text style={[styles.txAmount, tx.direction === 'out' && styles.txAmountOut]}>
                    {tx.direction === 'out' ? '−' : '+'}
                    {formatGlas(tx.glasDelta)}
                  </Text>
                </View>
              ))}
            </GlassSurface>
          )}
        </View>
      </ScrollView>
      </TabFade>
    </View>
  );
}

function txIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'purchase':
      return 'bag-check-outline';
    case 'stake':
      return 'lock-closed-outline';
    case 'unstake':
      return 'lock-open-outline';
    case 'buy':
      return 'swap-horizontal-outline';
    case 'post_reward':
      return 'people-outline';
    case 'tier_purchase':
      return 'flash';
    case 'purchase_glas':
      return 'arrow-up-circle-outline';
    default:
      return 'ellipse-outline';
  }
}

function DiagnosisHistoryCard() {
  const router = useRouter();
  const result = useQuizStore((s) => s.result);
  const history = useQuizStore((s) => s.history);

  if (!result) {
    return (
      <GlassSurface radius={radius.lg} padding={spacing.lg}>
        <View style={styles.diagHeaderRow}>
          <Ionicons name="analytics-outline" size={16} color={colors.accentViolet} />
          <Text style={styles.diagTitle}>진단 이력</Text>
        </View>
        <Text style={styles.diagSub}>아직 AI 진단 기록이 없어요. 첫 진단을 완료하면 여기서 변화를 추적할 수 있어요.</Text>
        <PillButton label="AI 진단 시작하기" onPress={() => router.push('/quiz')} style={{ marginTop: spacing.md }} />
      </GlassSurface>
    );
  }

  const previous = history[0];
  const daysAgo = daysSince(result.generatedAt);

  return (
    <GlassSurface radius={radius.lg} padding={spacing.lg}>
      <View style={styles.diagHeaderRow}>
        <Ionicons name="analytics-outline" size={16} color={colors.accentViolet} />
        <Text style={styles.diagTitle}>진단 이력</Text>
      </View>
      <Text style={styles.diagSub}>
        마지막 진단: {daysAgo <= 0 ? '오늘' : `${daysAgo}일 전`} · 30일마다 재진단을 추천해요
      </Text>

      {previous && (
        <View style={styles.diagGrid}>
          {RADAR_AXES.map((axis) => {
            const delta = Math.round((result.radar[axis.id] ?? 0) - (previous.radar[axis.id] ?? 0));
            const color = delta === 0 ? colors.textFaint : delta > 0 ? colors.success : colors.danger;
            return (
              <View key={axis.id} style={styles.diagItem}>
                <Text style={styles.diagLabel}>{axis.label}</Text>
                <Text style={[styles.diagDelta, { color }]}>
                  {delta > 0 ? '+' : ''}
                  {delta}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <PillButton label="다시 진단하기" variant="ghost" onPress={() => router.push('/quiz')} style={{ marginTop: spacing.md }} />
    </GlassSurface>
  );
}

function SourceRow({
  icon,
  color,
  label,
  value,
  tooltip,
  isOpen,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value: number;
  tooltip: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.sourceItem}>
      <View style={styles.sourceRow}>
        <View style={[styles.sourceIconWrap, { backgroundColor: `${color}22` }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={styles.sourceLabel}>{label}</Text>
        <Pressable onPress={onToggle} style={styles.sourceHelpBtn}>
          <Text style={styles.sourceHelpText}>?</Text>
        </Pressable>
      </View>
      <Text style={styles.sourceValue}>{formatGlas(value)} GLAS</Text>
      {isOpen && <Text style={styles.sourceTooltip}>{tooltip}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  pageTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  glasKicker: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  glasTotal: { fontFamily: fonts.display, fontSize: 30, color: colors.text, marginTop: 4 },
  diagHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diagTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  diagSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6, lineHeight: 16 },
  diagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  diagItem: { width: '28%' },
  diagLabel: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted },
  diagDelta: { fontFamily: fonts.bodyBold, fontSize: 15, marginTop: 2 },
  sourceIntro: { fontFamily: fonts.body, fontSize: 11, color: colors.textFaint, marginTop: 6 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  sourceItem: { width: '47%' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sourceIconWrap: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  sourceLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, flex: 1 },
  sourceHelpBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceHelpText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.textFaint },
  sourceValue: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text, marginTop: 4 },
  sourceTooltip: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, marginTop: 4, lineHeight: 14 },
  pendingNote: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: spacing.md },
  periodRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  periodChip: {
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  periodChipActive: { backgroundColor: colors.accentViolet, borderColor: colors.accentViolet },
  periodChipText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textMuted },
  periodChipTextActive: { color: '#0B0B0D' },
  stableRow: { flexDirection: 'row', gap: spacing.md },
  stableLabel: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  stableValue: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.text, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  noticeText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.danger },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text },
  demoToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  demoToggleText: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted },
  stakeRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  txDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  txIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  txSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txAmount: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.success },
  txAmountOut: { color: colors.danger },
  unstakeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accentViolet,
  },
  unstakeBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
  unstakeBtnText: { fontFamily: fonts.bodyBold, fontSize: 11, color: '#0B0B0D' },
});
