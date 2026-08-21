import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PillButton } from '@/components/glass/PillButton';
import { ProductArt } from '@/components/glass/ProductArt';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { LanguageCode, SCAN_PRODUCTS } from '@/data/mock';
import { formatUsd } from '@/lib/format';
import { getProductById, useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

type Step = 'viewfinder' | 'recognized' | 'result';

const SECTION_LABELS: Record<LanguageCode, Record<'efficacy' | 'dosage' | 'precautions' | 'sideEffects' | 'manufacturer', string>> = {
  ko: { manufacturer: '제조사', efficacy: '효능·효과', dosage: '복용법', precautions: '주의사항', sideEffects: '부작용' },
  en: { manufacturer: 'Manufacturer', efficacy: 'Efficacy', dosage: 'Dosage', precautions: 'Precautions', sideEffects: 'Side Effects' },
  zh: { manufacturer: '制造商', efficacy: '功效', dosage: '用法用量', precautions: '注意事项', sideEffects: '副作用' },
  vi: { manufacturer: 'Nhà sản xuất', efficacy: 'Công dụng', dosage: 'Cách dùng', precautions: 'Lưu ý', sideEffects: 'Tác dụng phụ' },
};

const UI_LABELS: Record<LanguageCode, { alreadyBought: string; addToCart: string; scanAgain: string; recognized: string; aim: string }> = {
  ko: { alreadyBought: '내가 구매한 제품', addToCart: '장바구니 담기', scanAgain: '다시 스캔', recognized: '인식 완료', aim: '제품에 카메라를 맞춰주세요' },
  en: { alreadyBought: 'You bought this', addToCart: 'Add to Cart', scanAgain: 'Scan again', recognized: 'Recognized', aim: 'Point the camera at a product' },
  zh: { alreadyBought: '我已购买的产品', addToCart: '加入购物车', scanAgain: '重新扫描', recognized: '识别完成', aim: '请将镜头对准产品' },
  vi: { alreadyBought: 'Sản phẩm bạn đã mua', addToCart: 'Thêm vào giỏ', scanAgain: 'Quét lại', recognized: 'Đã nhận diện', aim: 'Hướng camera vào sản phẩm' },
};

function ScanLine() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withSequence(withTiming(1, { duration: 1200, easing: Easing.linear }), withTiming(0, { duration: 0 })), -1);
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 220 }] }));
  return <Animated.View style={[styles.scanLine, style]} />;
}

function ViewfinderFrame() {
  return (
    <View style={styles.viewfinder}>
      <ScanLine />
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </View>
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('viewfinder');
  const [index, setIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const language = useAppStore((s) => s.language);
  const openPayment = useUiStore((s) => s.openPayment);

  const scan = SCAN_PRODUCTS[index];
  const product = getProductById(scan.productId);
  const detail = scan.translations[language];
  const labels = SECTION_LABELS[language];
  const ui = UI_LABELS[language];

  const runScan = () => {
    setStep('viewfinder');
    const t1 = setTimeout(() => {
      setStep('recognized');
      const t2 = setTimeout(() => setStep('result'), 700);
      timers.current.push(t2);
    }, 2000);
    timers.current.push(t1);
  };

  useEffect(() => {
    runScan();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanAgain = () => {
    setIndex((i) => (i + 1) % SCAN_PRODUCTS.length);
    runScan();
  };

  if (!product) return null;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={10}>
        <Ionicons name="close" size={18} color={colors.text} />
      </Pressable>

      {(step === 'viewfinder' || step === 'recognized') && (
        <View style={styles.centerRoot}>
          <ViewfinderFrame />
          {step === 'viewfinder' ? (
            <Text style={styles.hint}>{ui.aim}</Text>
          ) : (
            <Animated.View entering={ZoomIn.duration(300)} style={styles.recognizedRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.recognizedText}>{ui.recognized}</Text>
            </Animated.View>
          )}
        </View>
      )}

      {step === 'result' && (
        <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.artWrap}>
              <ProductArt seed={product.id} shape={product.shape} style={styles.art} />
            </View>

            <View style={styles.sourceBadge}>
              <Ionicons name="shield-checkmark" size={11} color={colors.accentGold} />
              <Text style={styles.sourceBadgeText}>{scan.sourceBadge}</Text>
            </View>

            {scan.alreadyPurchased ? (
              <View style={styles.ownedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={styles.ownedBadgeText}>{ui.alreadyBought}</Text>
              </View>
            ) : null}

            <Text style={styles.name}>{detail.name}</Text>
            <Text style={styles.price}>{formatUsd(product.priceUSD)}</Text>

            <DetailRow label={labels.manufacturer} value={detail.manufacturer} />
            <DetailRow label={labels.efficacy} value={detail.efficacy} />
            <DetailRow label={labels.dosage} value={detail.dosage} />
            <DetailRow label={labels.precautions} value={detail.precautions} warn />
            <DetailRow label={labels.sideEffects} value={detail.sideEffects} warn />

            {!scan.alreadyPurchased && (
              <PillButton
                label={ui.addToCart}
                onPress={() => openPayment({ kind: 'product', title: product.name, subtitle: 'GLASSY Myeongdong Pharmacy', priceUSD: product.priceUSD })}
                colors_={['#B18CFF', '#8C5CE0']}
                style={{ marginTop: spacing.xl }}
              />
            )}
            <Pressable onPress={scanAgain} style={styles.scanAgainBtn}>
              <Ionicons name="scan-outline" size={14} color={colors.textMuted} />
              <Text style={styles.scanAgainText}>{ui.scanAgain}</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

function DetailRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, warn && styles.detailLabelWarn]}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  closeBtn: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRoot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  scanLine: {
    position: 'absolute',
    top: 10,
    width: 220,
    height: 2,
    backgroundColor: colors.accentGold,
    shadowColor: colors.accentGold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: colors.accentGold },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 6 },
  hint: { fontFamily: fonts.bodyMed, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: spacing.xl },
  recognizedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
    backgroundColor: 'rgba(74,222,154,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  recognizedText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.success },
  resultScroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl },
  artWrap: { alignItems: 'center', marginTop: spacing.md },
  art: { width: 140, height: 175 },
  sourceBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(232,196,104,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  sourceBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.accentGold },
  ownedBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(74,222,154,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ownedBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.success },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.text, textAlign: 'center', marginTop: spacing.lg },
  price: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  detailRow: { marginTop: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderDim },
  detailLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.accentViolet, textTransform: 'uppercase', letterSpacing: 0.4 },
  detailLabelWarn: { color: colors.danger },
  detailValue: { fontFamily: fonts.body, fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 19 },
  scanAgainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.lg, paddingVertical: spacing.sm },
  scanAgainText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
});
