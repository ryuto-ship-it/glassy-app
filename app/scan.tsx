import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PillButton } from '@/components/glass/PillButton';
import { ProductArt } from '@/components/glass/ProductArt';
// This screen is a deliberately dark "camera" experience regardless of the
// app's light default theme, so it aliases the preserved dark token set —
// see constants/theme.ts's note on <DarkScope> screens.
import { darkColors as colors, fonts, radius, spacing } from '@/constants/theme';
import { LanguageCode, ProductShape, SCAN_PRODUCTS } from '@/data/mock';
import { hashSeed } from '@/lib/artSeed';
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

const UI_LABELS: Record<
  LanguageCode,
  {
    alreadyBought: string;
    addToCart: string;
    scanAgain: string;
    recognized: string;
    aim: string;
    statusFocus: string;
    statusIdentify: string;
    statusAnalyze: string;
    confidence: string;
  }
> = {
  ko: {
    alreadyBought: '내가 구매한 제품',
    addToCart: '장바구니 담기',
    scanAgain: '다시 스캔',
    recognized: '인식 완료',
    aim: '제품에 카메라를 맞춰주세요',
    statusFocus: '초점을 맞추는 중...',
    statusIdentify: '제품 형태 인식 중...',
    statusAnalyze: 'AI가 성분을 분석하고 있어요...',
    confidence: 'AI 인식 정확도',
  },
  en: {
    alreadyBought: 'You bought this',
    addToCart: 'Add to Cart',
    scanAgain: 'Scan again',
    recognized: 'Recognized',
    aim: 'Point the camera at a product',
    statusFocus: 'Focusing...',
    statusIdentify: 'Detecting product shape...',
    statusAnalyze: 'AI is analyzing the ingredients...',
    confidence: 'AI match confidence',
  },
  zh: {
    alreadyBought: '我已购买的产品',
    addToCart: '加入购物车',
    scanAgain: '重新扫描',
    recognized: '识别完成',
    aim: '请将镜头对准产品',
    statusFocus: '正在对焦...',
    statusIdentify: '正在识别产品形状...',
    statusAnalyze: 'AI正在分析成分...',
    confidence: 'AI识别准确度',
  },
  vi: {
    alreadyBought: 'Sản phẩm bạn đã mua',
    addToCart: 'Thêm vào giỏ',
    scanAgain: 'Quét lại',
    recognized: 'Đã nhận diện',
    aim: 'Hướng camera vào sản phẩm',
    statusFocus: 'Đang lấy nét...',
    statusIdentify: 'Đang nhận diện hình dạng...',
    statusAnalyze: 'AI đang phân tích thành phần...',
    confidence: 'Độ chính xác AI',
  },
};

function statusForProgress(progress: number, ui: (typeof UI_LABELS)['ko']) {
  if (progress < 30) return ui.statusFocus;
  if (progress < 70) return ui.statusIdentify;
  return ui.statusAnalyze;
}

function ScanLine() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withSequence(withTiming(1, { duration: 1300, easing: Easing.linear }), withTiming(0, { duration: 0 })), -1);
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 210 }] }));
  return <Animated.View style={[styles.scanLine, style]} />;
}

function AiPulseDot() {
  const o = useSharedValue(0.4);
  useEffect(() => {
    o.value = withRepeat(withSequence(withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }), withTiming(0.4, { duration: 480 })), -1);
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.aiDot, style]} />;
}

function ViewfinderFrame({ product }: { product: { id: string; shape: ProductShape } }) {
  const lock = useSharedValue(0);
  useEffect(() => {
    lock.value = 0;
    lock.value = withDelay(180, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [lock, product.id]);

  const frameStyle = useAnimatedStyle(() => {
    const size = 258 - lock.value * 68;
    return { width: size, height: size };
  });
  const artStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + lock.value * 0.7,
    transform: [{ scale: 0.88 + lock.value * 0.12 }],
  }));

  return (
    <View style={styles.viewfinderOuter}>
      <LinearGradient colors={['rgba(177,140,255,0.22)', 'rgba(5,5,6,0)']} style={styles.viewfinderGlow} />
      <View style={styles.viewfinderShelf} />
      <Animated.View style={[styles.viewfinder, frameStyle]}>
        <Animated.View style={[styles.viewfinderArt, artStyle]}>
          <ProductArt seed={product.id} shape={product.shape} style={styles.viewfinderArtImg} />
        </Animated.View>
        <ScanLine />
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </Animated.View>
    </View>
  );
}

function PulseRing() {
  const s = useSharedValue(0.7);
  const o = useSharedValue(0.55);
  useEffect(() => {
    s.value = withTiming(1.9, { duration: 750, easing: Easing.out(Easing.quad) });
    o.value = withTiming(0, { duration: 750 });
  }, [s, o]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return <Animated.View style={[styles.pulseRing, style]} />;
}

const SECTION_META: Record<
  'manufacturer' | 'efficacy' | 'dosage' | 'precautions' | 'sideEffects',
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  manufacturer: { icon: 'business-outline', color: '#7FA6FF' },
  efficacy: { icon: 'leaf-outline', color: colors.success },
  dosage: { icon: 'time-outline', color: colors.accentGold },
  precautions: { icon: 'alert-circle-outline', color: '#FF9F5A' },
  sideEffects: { icon: 'warning-outline', color: colors.danger },
};

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('viewfinder');
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const language = useAppStore((s) => s.language);
  const openPayment = useUiStore((s) => s.openPayment);

  const scan = SCAN_PRODUCTS[index];
  const product = getProductById(scan.productId);
  const detail = scan.translations[language];
  const labels = SECTION_LABELS[language];
  const ui = UI_LABELS[language];
  const confidence = product ? 94 + (hashSeed(product.id) % 6) : 97;

  const runScan = () => {
    setStep('viewfinder');
    setProgress(0);
    const startedAt = Date.now();
    progressTimer.current = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startedAt) / 1900) * 100));
      setProgress(pct);
    }, 80);
    const t1 = setTimeout(() => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      setProgress(100);
      setStep('recognized');
      const t2 = setTimeout(() => setStep('result'), 700);
      timers.current.push(t2);
    }, 2000);
    timers.current.push(t1);
  };

  useEffect(() => {
    runScan();
    return () => {
      timers.current.forEach(clearTimeout);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
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
          <View style={styles.frameZone}>
            <ViewfinderFrame product={product} />
            {step === 'recognized' && <PulseRing />}
          </View>
          {step === 'viewfinder' ? (
            <View style={styles.statusBlock}>
              <View style={styles.aiChip}>
                <AiPulseDot />
                <Text style={styles.aiChipText}>AI</Text>
              </View>
              <Text style={styles.hint}>{statusForProgress(progress, ui)}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
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
            <Animated.View entering={ZoomIn.duration(380)} style={styles.artWrap}>
              <ProductArt seed={product.id} shape={product.shape} style={styles.art} />
            </Animated.View>

            <View style={styles.badgeRow}>
              <View style={styles.sourceBadge}>
                <Ionicons name="shield-checkmark" size={11} color={colors.accentGold} />
                <Text style={styles.sourceBadgeText}>{scan.sourceBadge}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Ionicons name="flash" size={11} color="#7FA6FF" />
                <Text style={styles.confidenceBadgeText}>
                  {ui.confidence} {confidence}%
                </Text>
              </View>
            </View>

            {scan.alreadyPurchased ? (
              <View style={styles.ownedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={styles.ownedBadgeText}>{ui.alreadyBought}</Text>
              </View>
            ) : null}

            <Text style={styles.name}>{detail.name}</Text>
            <Text style={styles.price}>{formatUsd(product.priceUSD)}</Text>

            <InfoCard meta={SECTION_META.manufacturer} label={labels.manufacturer} value={detail.manufacturer} delay={40} />
            <InfoCard meta={SECTION_META.efficacy} label={labels.efficacy} value={detail.efficacy} delay={100} />
            <InfoCard meta={SECTION_META.dosage} label={labels.dosage} value={detail.dosage} delay={160} />
            <InfoCard meta={SECTION_META.precautions} label={labels.precautions} value={detail.precautions} delay={220} />
            <InfoCard meta={SECTION_META.sideEffects} label={labels.sideEffects} value={detail.sideEffects} delay={280} />

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

function InfoCard({
  meta,
  label,
  value,
  delay,
}: {
  meta: { icon: keyof typeof Ionicons.glyphMap; color: string };
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(320)} style={styles.infoCard}>
      <View style={[styles.infoCardStripe, { backgroundColor: meta.color }]} />
      <View style={styles.infoCardBody}>
        <View style={styles.infoCardHead}>
          <View style={[styles.infoCardIcon, { backgroundColor: `${meta.color}22` }]}>
            <Ionicons name={meta.icon} size={13} color={meta.color} />
          </View>
          <Text style={[styles.infoCardLabel, { color: meta.color }]}>{label}</Text>
        </View>
        <Text style={styles.infoCardValue}>{value}</Text>
      </View>
    </Animated.View>
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
  frameZone: { alignItems: 'center', justifyContent: 'center' },
  viewfinderOuter: { width: 258, height: 258, alignItems: 'center', justifyContent: 'center' },
  viewfinderGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  viewfinderShelf: {
    position: 'absolute',
    bottom: 18,
    width: 150,
    height: 26,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  viewfinder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.16)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  viewfinderArt: { width: 120, height: 150, alignItems: 'center', justifyContent: 'center' },
  viewfinderArtImg: { width: 120, height: 150 },
  scanLine: {
    position: 'absolute',
    top: 8,
    width: '82%',
    height: 2,
    backgroundColor: colors.accentGold,
    shadowColor: colors.accentGold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.accentGold },
  cornerTL: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 6 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 6 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 6 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 6 },
  pulseRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: colors.success,
  },
  statusBlock: { alignItems: 'center', marginTop: spacing.xl, width: 220 },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(177,140,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(177,140,255,0.3)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  aiChipText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.accentViolet, letterSpacing: 0.5 },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentViolet },
  hint: { fontFamily: fonts.bodyMed, fontSize: 12.5, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accentGold, borderRadius: 2 },
  progressText: { fontFamily: fonts.bodyBold, fontSize: 10.5, color: colors.accentGold, marginTop: 6 },
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
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.lg, flexWrap: 'wrap' },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(232,196,104,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  sourceBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.accentGold },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(127,166,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(127,166,255,0.32)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  confidenceBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#7FA6FF' },
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
  infoCard: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDim,
    overflow: 'hidden',
  },
  infoCardStripe: { width: 4 },
  infoCardBody: { flex: 1, padding: spacing.md },
  infoCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoCardIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoCardLabel: { fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  infoCardValue: { fontFamily: fonts.body, fontSize: 13, color: colors.text, lineHeight: 19 },
  scanAgainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.lg, paddingVertical: spacing.sm },
  scanAgainText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
});
