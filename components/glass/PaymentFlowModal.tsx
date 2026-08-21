import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { GLAS_PRICE_USD } from '@/data/mock';
import { formatGlas, formatUsd } from '@/lib/format';
import { PaymentMethod, useAppStore } from '@/store/useAppStore';
import { AppModal } from './AppModal';
import { GlassSurface } from './GlassSurface';
import { PillButton } from './PillButton';

export type PaymentVariant =
  | { kind: 'product'; title: string; subtitle: string; priceUSD: number }
  | { kind: 'tier'; tierName: string; usdCost: number; glasAmount: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  variant: PaymentVariant;
  onSuccess?: () => void;
};

type Step =
  | 'method'
  | 'wallet-select'
  | 'wallet-connecting'
  | 'wallet-connected'
  | 'stable-confirm'
  | 'wallet-sign'
  | 'stable-processing'
  | 'card-input'
  | 'card-processing'
  | 'glas-confirm'
  | 'glas-processing'
  | 'success';

const WALLETS: { id: string; name: string; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'metamask', name: 'MetaMask', color: '#F6851B', icon: 'flame' },
  { id: 'trust', name: 'Trust Wallet', color: '#3375BB', icon: 'shield-checkmark' },
];

function mockHex(len: number): string {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

export function PaymentFlowModal({ visible, onClose, variant, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('method');
  const [wallet, setWallet] = useState<(typeof WALLETS)[number] | null>(null);
  const [token, setToken] = useState<'USDT' | 'USDC'>('USDT');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ creditGlas?: number; debitGlas?: number; ref: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [gasFee] = useState(() => (0.06 + Math.random() * 0.09).toFixed(2));

  const checkoutPurchase = useAppStore((s) => s.checkoutPurchase);
  const buyTierDirect = useAppStore((s) => s.buyTierDirect);
  const spendableGlas = useAppStore((s) => s.spendableGlas());

  const priceUSD = variant.kind === 'product' ? variant.priceUSD : variant.usdCost;
  const title = variant.kind === 'product' ? variant.title : `${variant.tierName} 등급 즉시구매`;
  const subtitle = variant.kind === 'product' ? variant.subtitle : '락업 없이 즉시 등급에 반영돼요';
  const glasCost = Math.ceil(priceUSD / GLAS_PRICE_USD);
  const canPayGlas = variant.kind === 'product' && spendableGlas >= glasCost;

  useEffect(() => {
    if (visible) {
      setStep('method');
      setWallet(null);
      setError(null);
      setResult(null);
    }
    return () => timers.current.forEach(clearTimeout);
  }, [visible]);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const selectMethod = (method: PaymentMethod) => {
    setError(null);
    if (method === 'stablecoin') setStep('wallet-select');
    else if (method === 'card') setStep('card-input');
    else setStep('glas-confirm');
  };

  const selectWallet = (w: (typeof WALLETS)[number]) => {
    setWallet(w);
    setStep('wallet-connecting');
    after(1300, () => {
      setStep('wallet-connected');
      after(900, () => setStep('stable-confirm'));
    });
  };

  const confirmStable = () => setStep('wallet-sign');

  const signApprove = () => {
    setStep('stable-processing');
    after(1100, () => {
      let creditGlas = 0;
      if (variant.kind === 'product') {
        checkoutPurchase(title, subtitle, priceUSD, 'stablecoin');
        creditGlas = Math.round(priceUSD * 4);
      } else {
        buyTierDirect(priceUSD, 'stablecoin');
        creditGlas = variant.glasAmount;
      }
      setResult({ creditGlas, ref: `0x${mockHex(8)}...${mockHex(6)}` });
      setStep('success');
    });
  };

  const signReject = () => setStep('stable-confirm');

  const confirmCard = () => {
    setStep('card-processing');
    after(1300, () => {
      let creditGlas = 0;
      if (variant.kind === 'product') {
        checkoutPurchase(title, subtitle, priceUSD, 'card');
        creditGlas = Math.round(priceUSD * 4);
      } else {
        buyTierDirect(priceUSD, 'card');
        creditGlas = variant.glasAmount;
      }
      setResult({ creditGlas, ref: `GLS-${mockHex(6).toUpperCase()}` });
      setStep('success');
    });
  };

  const confirmGlas = () => {
    if (variant.kind !== 'product' || !canPayGlas) return;
    setStep('glas-processing');
    after(900, () => {
      const res = checkoutPurchase(title, subtitle, priceUSD, 'glas');
      if (!res.ok) {
        setError(res.reason ?? '결제에 실패했어요.');
        setStep('glas-confirm');
        return;
      }
      setResult({ debitGlas: glasCost, ref: `GLS-${mockHex(6).toUpperCase()}` });
      setStep('success');
    });
  };

  const finish = () => {
    onSuccess?.();
    onClose();
  };

  const dismissable = !['stable-processing', 'card-processing', 'glas-processing', 'wallet-connecting'].includes(step);

  return (
    <AppModal visible={visible} onClose={onClose} dismissable={dismissable}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {step === 'method' && (
          <StepFade>
            <Header title="결제 수단 선택" subtitle={title} />
            <Text style={styles.price}>{formatUsd(priceUSD)}</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              <MethodRow icon="swap-horizontal-outline" label="스테이블코인" sub="USDT / USDC · 지갑 연결" onPress={() => selectMethod('stablecoin')} />
              <MethodRow icon="card-outline" label="신용카드" sub="MoonPay 연동" onPress={() => selectMethod('card')} />
              {variant.kind === 'product' && (
                <MethodRow
                  icon="flash-outline"
                  label="$GLAS"
                  sub={`보유 ${formatGlas(spendableGlas)} GLAS`}
                  onPress={() => selectMethod('glas')}
                />
              )}
            </View>
          </StepFade>
        )}

        {step === 'wallet-select' && (
          <StepFade>
            <BackHeader onBack={() => setStep('method')} title="지갑 연결하기" subtitle="결제를 진행하려면 지갑을 연결해주세요." />
            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              {WALLETS.map((w) => (
                <Pressable key={w.id} onPress={() => selectWallet(w)} style={styles.walletRow}>
                  <View style={[styles.walletIcon, { backgroundColor: `${w.color}26` }]}>
                    <Ionicons name={w.icon} size={18} color={w.color} />
                  </View>
                  <Text style={styles.walletName}>{w.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                </Pressable>
              ))}
            </View>
          </StepFade>
        )}

        {step === 'wallet-connecting' && (
          <StepFade>
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.accentViolet} />
              <Text style={styles.centerText}>{wallet?.name}에 연결 중...</Text>
            </View>
          </StepFade>
        )}

        {step === 'wallet-connected' && (
          <StepFade>
            <View style={styles.centerBlock}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={26} color="#0B0B0D" />
              </View>
              <Text style={styles.centerTitle}>지갑 연결 완료</Text>
              <Text style={styles.centerText}>0x7a3F...9c2D 연결됨</Text>
            </View>
          </StepFade>
        )}

        {step === 'stable-confirm' && (
          <StepFade>
            <View style={styles.connectedChip}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={styles.connectedChipText}>{wallet?.name} · 0x7a3F...9c2D</Text>
            </View>
            <Header title="결제 확인" subtitle={title} />
            <Text style={styles.price}>{formatUsd(priceUSD)}</Text>

            <Text style={styles.fieldLabel}>결제 토큰</Text>
            <View style={styles.tokenRow}>
              {(['USDT', 'USDC'] as const).map((t) => (
                <Pressable key={t} onPress={() => setToken(t)} style={{ flex: 1 }}>
                  <View style={[styles.tokenChip, token === t && styles.tokenChipActive]}>
                    <Text style={[styles.tokenChipText, token === t && styles.tokenChipTextActive]}>{t}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.summaryBox}>
              <SummaryRow label="환산 수량" value={`${priceUSD.toFixed(2)} ${token}`} />
              <SummaryRow label="네트워크 수수료 (가스비)" value={`~$${gasFee}`} />
            </View>

            <PillButton label="결제 확인" onPress={confirmStable} colors_={['#B18CFF', '#8C5CE0']} style={{ marginTop: spacing.lg }} />
          </StepFade>
        )}

        {step === 'wallet-sign' && (
          <StepFade>
            <View style={styles.signCard}>
              <View style={styles.signHeaderRow}>
                <View style={[styles.walletIcon, { backgroundColor: `${wallet?.color}26` }]}>
                  <Ionicons name={wallet?.icon ?? 'wallet-outline'} size={16} color={wallet?.color ?? colors.text} />
                </View>
                <Text style={styles.signHeaderTitle}>지갑 서명 요청</Text>
              </View>
              <Text style={styles.signBody}>다음 트랜잭션에 서명하시겠습니까?</Text>
              <View style={styles.summaryBox}>
                <SummaryRow label="받는 곳" value="GLASSY Checkout" />
                <SummaryRow label="금액" value={`${priceUSD.toFixed(2)} ${token}`} />
                <SummaryRow label="가스비" value={`~$${gasFee}`} />
                <SummaryRow label="네트워크" value="Ethereum (Mock)" />
              </View>
              <View style={styles.signBtnRow}>
                <PillButton label="거부" variant="ghost" onPress={signReject} style={{ flex: 1 }} />
                <PillButton label="확인" onPress={signApprove} colors_={['#B18CFF', '#8C5CE0']} style={{ flex: 1 }} />
              </View>
            </View>
          </StepFade>
        )}

        {step === 'stable-processing' && (
          <StepFade>
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.accentViolet} />
              <Text style={styles.centerText}>결제 처리 중...</Text>
            </View>
          </StepFade>
        )}

        {step === 'card-input' && (
          <StepFade>
            <BackHeader onBack={() => setStep('method')} title="카드 정보 입력" subtitle="Powered by MoonPay (데모 연동)" />
            <Text style={styles.price}>{formatUsd(priceUSD)}</Text>
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <CardField label="카드 번호" defaultValue="4242 4242 4242 4242" />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <CardField label="유효기간" defaultValue="12/28" style={{ flex: 1 }} />
                <CardField label="CVC" defaultValue="123" style={{ flex: 1 }} secure />
              </View>
            </View>
            <PillButton label="MoonPay로 결제하기" onPress={confirmCard} colors_={['#E8C468', '#C79A3D']} style={{ marginTop: spacing.lg }} />
          </StepFade>
        )}

        {step === 'card-processing' && (
          <StepFade>
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.accentGold} />
              <Text style={styles.centerText}>MoonPay 처리 중...</Text>
            </View>
          </StepFade>
        )}

        {step === 'glas-confirm' && (
          <StepFade>
            <BackHeader onBack={() => setStep('method')} title="$GLAS 결제" subtitle={title} />
            <Text style={styles.price}>{formatUsd(priceUSD)}</Text>
            <View style={styles.summaryBox}>
              <SummaryRow label="상품가 → GLAS 환산" value={`${formatGlas(glasCost)} GLAS`} />
              <SummaryRow label={`현재가(${formatUsd(GLAS_PRICE_USD)}) 기준`} value="결제 시점 시세로 재계산" />
              <SummaryRow label="보유 GLAS" value={`${formatGlas(spendableGlas)} GLAS`} />
              <SummaryRow label="결제 후 잔액" value={`${formatGlas(Math.max(0, spendableGlas - glasCost))} GLAS`} />
            </View>
            {!canPayGlas && <Text style={styles.errorText}>보유 GLAS가 부족해요.</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Text style={styles.detailNote}>GLAS 결제는 등급 영구 유지 규칙에 영향을 주지 않아요.</Text>
            <PillButton
              label="차감 확인"
              onPress={confirmGlas}
              disabled={!canPayGlas}
              colors_={['#B18CFF', '#8C5CE0']}
              style={{ marginTop: spacing.lg }}
            />
          </StepFade>
        )}

        {step === 'glas-processing' && (
          <StepFade>
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.accentViolet} />
              <Text style={styles.centerText}>GLAS 차감 처리 중...</Text>
            </View>
          </StepFade>
        )}

        {step === 'success' && result && (
          <StepFade>
            <View style={styles.centerBlock}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={30} color="#0B0B0D" />
              </View>
              <Text style={styles.centerTitle}>결제 완료!</Text>
              {result.creditGlas !== undefined ? (
                <Text style={styles.centerText}>
                  {variant.kind === 'tier' ? `${formatGlas(result.creditGlas)} GLAS 즉시구매 완료` : `+${formatGlas(result.creditGlas)} GLAS 적립됨`}
                </Text>
              ) : (
                <Text style={styles.centerText}>{formatGlas(result.debitGlas ?? 0)} GLAS 차감 완료</Text>
              )}
              <View style={styles.refBox}>
                <Text style={styles.refLabel}>{result.ref.startsWith('0x') ? '트랜잭션' : '주문 번호'}</Text>
                <Text style={styles.refValue}>{result.ref}</Text>
              </View>
              <PillButton label="완료" onPress={finish} colors_={['#B18CFF', '#8C5CE0']} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
            </View>
          </StepFade>
        )}
      </ScrollView>
    </AppModal>
  );
}

function StepFade({ children }: { children: React.ReactNode }) {
  return <Animated.View entering={FadeIn.duration(220)}>{children}</Animated.View>;
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
  );
}

function BackHeader({ onBack, title, subtitle }: { onBack: () => void; title: string; subtitle: string }) {
  return (
    <View>
      <Pressable onPress={onBack} style={styles.backRow}>
        <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        <Text style={styles.backText}>뒤로</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function MethodRow({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <GlassSurface radius={radius.md} padding={spacing.md} style={styles.methodRowInner}>
        <Ionicons name={icon} size={18} color={colors.accentGold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.methodLabel}>{label}</Text>
          <Text style={styles.methodSub}>{sub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </GlassSurface>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function CardField({
  label,
  defaultValue,
  secure,
  style,
}: {
  label: string;
  defaultValue: string;
  secure?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        secureTextEntry={secure}
        style={styles.cardInput}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: '100%' },
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { fontFamily: fonts.displaySemi, fontSize: 17, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  price: { fontFamily: fonts.display, fontSize: 26, color: colors.text, marginTop: spacing.sm },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: spacing.sm },
  backText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  methodRowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  methodLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  methodSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  walletIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  walletName: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, flex: 1 },
  centerBlock: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 6 },
  centerTitle: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text, marginTop: spacing.sm },
  centerText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.textMuted },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,222,154,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  connectedChipText: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.success },
  fieldLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: spacing.md, marginBottom: 6 },
  tokenRow: { flexDirection: 'row', gap: spacing.sm },
  tokenChip: {
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  tokenChipActive: { backgroundColor: colors.accentViolet, borderColor: colors.accentViolet },
  tokenChipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textMuted },
  tokenChipTextActive: { color: '#0B0B0D' },
  summaryBox: { marginTop: spacing.md, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  summaryValue: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.text },
  signCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(246,133,27,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(246,133,27,0.3)',
  },
  signHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  signHeaderTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.text },
  signBody: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  signBtnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cardInput: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  errorText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.danger, marginTop: spacing.sm },
  detailNote: { fontFamily: fonts.body, fontSize: 10, color: colors.textFaint, marginTop: spacing.sm },
  refBox: { marginTop: spacing.lg, alignItems: 'center' },
  refLabel: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textFaint },
  refValue: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginTop: 2 },
});
