import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatGlas, formatUsd } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { AppModal } from './AppModal';
import { PaymentFlowModal } from './PaymentFlowModal';
import { PillButton } from './PillButton';
import { PlaceholderArt } from './PlaceholderArt';

const COMPOSER_IMAGES = ['new-1', 'new-2', 'new-3'];

// Every bottom sheet / modal in the app is mounted exactly once, here, at
// the root layout level (a sibling of ToastHost/LevelUpOverlay). A screen
// nested inside the Tabs navigator can't reliably out-rank the floating
// tab bar's stacking just by raising its own z-index — the tab bar is a
// later sibling at the navigator level and paints on top regardless — so
// any sheet rendered deep inside a tab screen risks being clipped behind
// it. Screens ask for a sheet via useUiStore instead of rendering one.
export function GlobalSheets() {
  const activeSheet = useUiStore((s) => s.activeSheet);
  const closeSheet = useUiStore((s) => s.closeSheet);
  const walletActionMode = useUiStore((s) => s.walletActionMode);
  const paymentVariant = useUiStore((s) => s.paymentVariant);
  const paymentOnSuccess = useUiStore((s) => s.paymentOnSuccess);

  return (
    <>
      <AppModal visible={activeSheet === 'wallet-action'} onClose={closeSheet}>
        {activeSheet === 'wallet-action' && <WalletActionSheetContent mode={walletActionMode} onClose={closeSheet} />}
      </AppModal>

      <AppModal visible={activeSheet === 'composer'} onClose={closeSheet}>
        {activeSheet === 'composer' && <ComposerSheetContent onClose={closeSheet} />}
      </AppModal>

      {paymentVariant && (
        <PaymentFlowModal
          visible={activeSheet === 'payment'}
          onClose={closeSheet}
          variant={paymentVariant}
          onSuccess={() => paymentOnSuccess?.()}
        />
      )}
    </>
  );
}

function WalletActionSheetContent({ mode, onClose }: { mode: 'buy' | 'stake'; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const liquid = useAppStore((s) => s.liquidBoughtGlas);
  const usdt = useAppStore((s) => s.usdtBalance);
  const buyGlas = useAppStore((s) => s.buyGlas);
  const stakeGlas = useAppStore((s) => s.stakeGlas);

  const confirm = () => {
    const val = Number(amount);
    if (!val || val <= 0) return;
    if (mode === 'buy') buyGlas(val);
    else stakeGlas(Math.min(val, liquid));
    onClose();
  };

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.title}>{mode === 'buy' ? '$GLAS 거래소 매수' : '$GLAS 스테이킹'}</Text>
      {mode === 'stake' && (
        <View style={styles.lockupNotice}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          <Text style={styles.lockupNoticeText}>스테이킹은 최소 30일 락업 후 등급에 반영돼요.</Text>
        </View>
      )}
      <Text style={styles.hint}>
        {mode === 'buy' ? `사용 가능 USDT: ${formatUsd(usdt)}` : `스테이킹 가능 GLAS: ${formatGlas(liquid)}`}
      </Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder={mode === 'buy' ? 'USDT 금액 입력' : 'GLAS 수량 입력'}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <PillButton label="확인" onPress={confirm} style={{ marginTop: spacing.lg }} />
      <Pressable onPress={onClose} style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Text style={styles.cancelText}>취소</Text>
      </Pressable>
    </View>
  );
}

function ComposerSheetContent({ onClose }: { onClose: () => void }) {
  const [caption, setCaption] = useState('');
  const [pickedImage, setPickedImage] = useState(COMPOSER_IMAGES[0]);
  const addCommunityPost = useAppStore((s) => s.addCommunityPost);

  const submit = () => {
    if (!caption.trim()) return;
    addCommunityPost(caption.trim(), [pickedImage]);
    onClose();
  };

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.title}>새 후기 작성</Text>
      <Text style={styles.hint}>후기를 등록하면 GLAS 리워드를 받아요.</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        {COMPOSER_IMAGES.map((img) => (
          <Pressable key={img} onPress={() => setPickedImage(img)}>
            <PlaceholderArt seed={img} style={[styles.pickThumb, pickedImage === img && styles.pickThumbActive]} />
          </Pressable>
        ))}
      </View>

      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="어떤 제품을 써보셨나요?"
        placeholderTextColor={colors.textMuted}
        style={styles.textArea}
        multiline
      />
      <PillButton label="등록하고 GLAS 받기" onPress={submit} style={{ marginTop: spacing.lg }} />
      <Pressable onPress={onClose} style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Text style={styles.cancelText}>취소</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  title: { fontFamily: fonts.displaySemi, fontSize: 17, color: colors.text },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: spacing.md },
  lockupNotice: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(177,140,255,0.12)',
  },
  lockupNoticeText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.text, flex: 1 },
  input: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  pickThumb: { width: 64, height: 64, borderRadius: radius.md, opacity: 0.5 },
  pickThumbActive: { opacity: 1, borderWidth: 2, borderColor: colors.accentViolet },
  textArea: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.05)',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
