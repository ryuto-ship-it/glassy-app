import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/glass/AppBackground';
import { EmptyState } from '@/components/glass/EmptyState';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PillButton } from '@/components/glass/PillButton';
import { SkeletonBlock } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { STAKE_LOCKUP_DAYS } from '@/constants/glow';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { addDays, daysUntil, formatDateShort } from '@/lib/date';
import { formatGlas, formatUsd } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

type SheetMode = 'buy' | 'stake' | null;

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [amount, setAmount] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const purchaseEarned = useAppStore((s) => s.purchaseEarnedGlas);
  const liquid = useAppStore((s) => s.liquidBoughtGlas);
  const stakeEntries = useAppStore((s) => s.stakeEntries);
  const usdt = useAppStore((s) => s.usdtBalance);
  const usdc = useAppStore((s) => s.usdcBalance);
  const transactions = useAppStore((s) => s.transactions);
  const demoFastForward = useAppStore((s) => s.demoFastForward);
  const totalGlas = useAppStore((s) => s.totalGlas());
  const maturedStaked = useAppStore((s) => s.maturedStakedGlas());
  const pendingStaked = useAppStore((s) => s.pendingStakedGlas());

  const buyGlas = useAppStore((s) => s.buyGlas);
  const stakeGlas = useAppStore((s) => s.stakeGlas);
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

  const closeSheet = () => {
    setSheet(null);
    setAmount('');
  };

  const confirmSheet = () => {
    const val = Number(amount);
    if (!val || val <= 0) return;
    if (sheet === 'buy') buyGlas(val);
    if (sheet === 'stake') stakeGlas(Math.min(val, liquid));
    closeSheet();
  };

  const handleUnstake = (entryId: string) => {
    const res = unstakeEntry(entryId);
    setNotice(res.ok ? '언스테이킹이 완료됐어요.' : res.reason ?? null);
    setTimeout(() => setNotice(null), 3200);
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
          <Text style={styles.pageTitle}>지갑</Text>
          <Text style={styles.pageSub}>$GLAS는 결제 수단이 아니라 보유 개수로 등급을 결정해요.</Text>
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
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>구매 적립분</Text>
                  <Text style={styles.breakdownValue}>{formatGlas(purchaseEarned)}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>스테이킹 매수분</Text>
                  <Text style={styles.breakdownValue}>{formatGlas(maturedStaked)}</Text>
                </View>
              </View>
              {pendingStaked > 0 && (
                <Text style={styles.pendingNote}>
                  🔒 락업 중 {formatGlas(pendingStaked)} GLAS — 30일 후 등급에 반영돼요
                </Text>
              )}
              {liquid > 0 && (
                <Text style={styles.pendingNote}>💧 미스테이킹 {formatGlas(liquid)} GLAS 보유 중</Text>
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
          <PillButton label="거래소에서 매수" onPress={() => setSheet('buy')} style={{ flex: 1 }} />
          <PillButton
            label="스테이킹하기"
            variant="ghost"
            onPress={() => setSheet('stake')}
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
                  <Text style={styles.txAmount}>+{formatGlas(tx.glasDelta)}</Text>
                </View>
              ))}
            </GlassSurface>
          )}
        </View>
      </ScrollView>
      </TabFade>

      <Modal visible={sheet !== null} transparent animationType="fade" onRequestClose={closeSheet}>
        <Pressable style={styles.modalBackdrop} onPress={closeSheet} />
        <View style={styles.modalWrap}>
          <GlassSurface strong radius={radius.xl} padding={spacing.xl}>
            <Text style={styles.modalTitle}>{sheet === 'buy' ? '$GLAS 거래소 매수' : '$GLAS 스테이킹'}</Text>
            {sheet === 'stake' && (
              <View style={styles.lockupNotice}>
                <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
                <Text style={styles.lockupNoticeText}>스테이킹은 최소 30일 락업 후 등급에 반영돼요.</Text>
              </View>
            )}
            <Text style={styles.modalHint}>
              {sheet === 'buy' ? `사용 가능 USDT: ${formatUsd(usdt)}` : `스테이킹 가능 GLAS: ${formatGlas(liquid)}`}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={sheet === 'buy' ? 'USDT 금액 입력' : 'GLAS 수량 입력'}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <PillButton label="확인" onPress={confirmSheet} style={{ marginTop: spacing.lg }} />
            <Pressable onPress={closeSheet} style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
          </GlassSurface>
        </View>
      </Modal>
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
      return 'sparkles-outline';
    default:
      return 'ellipse-outline';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  pageTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  glasKicker: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  glasTotal: { fontFamily: fonts.display, fontSize: 30, color: colors.text, marginTop: 4 },
  breakdownRow: { flexDirection: 'row', marginTop: spacing.lg, alignItems: 'center' },
  breakdownItem: { flex: 1 },
  breakdownDivider: { width: 1, height: 32, backgroundColor: 'rgba(74,46,78,0.1)', marginHorizontal: spacing.md },
  breakdownLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  breakdownValue: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginTop: 2 },
  pendingNote: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: spacing.md },
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
  txDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(74,46,78,0.06)' },
  txIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(74,46,78,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  txSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txAmount: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.success },
  unstakeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLavender,
  },
  unstakeBtnDisabled: { backgroundColor: 'rgba(74,46,78,0.12)' },
  unstakeBtnText: { fontFamily: fonts.bodyBold, fontSize: 11, color: '#3D2640' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(74,46,78,0.35)' },
  modalWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  modalTitle: { fontFamily: fonts.displaySemi, fontSize: 17, color: colors.text },
  lockupNotice: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(216,199,245,0.35)',
  },
  lockupNoticeText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.text, flex: 1 },
  modalHint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: spacing.md },
  input: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(74,46,78,0.15)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  cancelText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
});
