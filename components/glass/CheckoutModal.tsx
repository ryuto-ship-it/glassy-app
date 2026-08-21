import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { GLAS_PRICE_USD } from '@/data/mock';
import { formatGlas, formatUsd } from '@/lib/format';
import { PaymentMethod, useAppStore } from '@/store/useAppStore';
import { GlassSurface } from './GlassSurface';
import { PillButton } from './PillButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  priceUSD: number;
  onSuccess?: () => void;
};

const METHODS: { id: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'stablecoin', label: '스테이블코인', icon: 'swap-horizontal-outline' },
  { id: 'card', label: '신용카드', icon: 'card-outline' },
  { id: 'glas', label: '$GLAS', icon: 'flash-outline' },
];

// Shared checkout sheet — used from Shop's "구매하기" and the AI results
// screen's "지금 담기". Always shows all 3 payment methods side by side so
// the GLAS-as-payment mechanic is visible everywhere a purchase happens.
export function CheckoutModal({ visible, onClose, title, subtitle, priceUSD, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('stablecoin');
  const [error, setError] = useState<string | null>(null);
  const checkoutPurchase = useAppStore((s) => s.checkoutPurchase);
  const spendableGlas = useAppStore((s) => s.spendableGlas());

  const glasNeeded = Math.ceil(priceUSD / GLAS_PRICE_USD);
  const canPayGlas = spendableGlas >= glasNeeded;
  const reward = Math.round(priceUSD * 4);

  const handleClose = () => {
    setError(null);
    setMethod('stablecoin');
    onClose();
  };

  const confirm = () => {
    const res = checkoutPurchase(title, subtitle, priceUSD, method);
    if (!res.ok) {
      setError(res.reason ?? '결제에 실패했어요.');
      return;
    }
    onSuccess?.();
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.wrap}>
        <GlassSurface strong radius={radius.xl} padding={spacing.xl}>
          <Text style={styles.title}>결제 수단 선택</Text>
          <Text style={styles.product} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.price}>{formatUsd(priceUSD)}</Text>

          <View style={styles.methodRow}>
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => {
                    setError(null);
                    setMethod(m.id);
                  }}
                  style={{ flex: 1 }}
                >
                  <View style={[styles.methodCard, active && styles.methodCardActive]}>
                    <Ionicons name={m.icon} size={18} color={active ? colors.accentGold : colors.textMuted} />
                    <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>{m.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {method === 'glas' ? (
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>
                상품가 {formatUsd(priceUSD)} → 현재가({formatUsd(GLAS_PRICE_USD)} 기준) {formatGlas(glasNeeded)} GLAS
                필요
              </Text>
              <Text style={styles.detailSub}>결제 시점 시세로 재계산됩니다. 보유 GLAS: {formatGlas(spendableGlas)}</Text>
              {!canPayGlas && <Text style={styles.errorText}>보유 GLAS가 부족해요.</Text>}
              <Text style={styles.detailNote}>GLAS 결제는 등급 영구 유지 규칙에 영향을 주지 않아요.</Text>
            </View>
          ) : (
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>결제 완료 시 +{reward} GLAS 적립돼요.</Text>
            </View>
          )}

          {error && method !== 'glas' && <Text style={styles.errorText}>{error}</Text>}

          <PillButton
            label="결제하기"
            onPress={confirm}
            disabled={method === 'glas' && !canPayGlas}
            colors_={['#B18CFF', '#8C5CE0']}
            style={{ marginTop: spacing.lg }}
          />
          <Pressable onPress={handleClose} style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text },
  product: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted, marginTop: 6 },
  price: { fontFamily: fonts.display, fontSize: 24, color: colors.text, marginTop: 4 },
  methodRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  methodCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  methodCardActive: { borderColor: colors.accentGold, backgroundColor: 'rgba(232,196,104,0.08)' },
  methodLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted },
  methodLabelActive: { color: colors.text, fontFamily: fonts.bodySemi },
  detailBox: { marginTop: spacing.lg },
  detailText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.text, lineHeight: 18 },
  detailSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 4 },
  detailNote: { fontFamily: fonts.body, fontSize: 10, color: colors.textFaint, marginTop: 6 },
  errorText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.danger, marginTop: 6 },
  cancelText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
});
