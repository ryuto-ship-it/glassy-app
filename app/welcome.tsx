import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PillButton } from '@/components/glass/PillButton';
import { colors, fonts, gradients, radius, spacing, TAGLINE } from '@/constants/theme';
import { WELCOME_BONUS_GLAS, useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

type Step = 'intro' | 'joining' | 'reward';

// The "매장 입구 웰컴 게이트웨이" — the mocked entry point for a customer
// who just scanned a store QR and is signing up for the first time. Shown
// automatically once per app session (see app/(tabs)/index.tsx) and
// replayable anytime from Profile → "웰컴 플로우 다시보기" for demos.
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('intro');
  const markWelcomeSeen = useUiStore((s) => s.markWelcomeSeen);
  const claimWelcomeBonus = useAppStore((s) => s.claimWelcomeBonus);

  useEffect(() => {
    markWelcomeSeen();
  }, [markWelcomeSeen]);

  const startSignup = (_provider: 'google' | 'email') => {
    setStep('joining');
    setTimeout(() => {
      claimWelcomeBonus();
      setStep('reward');
    }, 1300);
  };

  const goHome = () => router.back();

  return (
    <LinearGradient colors={gradients.background} style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      {step === 'intro' && (
        <Pressable onPress={goHome} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      )}

      {step === 'intro' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.introWrap}>
          <View style={styles.qrBadge}>
            <Ionicons name="qr-code" size={22} color={colors.accentGold} />
          </View>
          <Text style={styles.scannedText}>매장 QR 스캔 완료</Text>

          <Text style={styles.brand}>GLASSY</Text>
          <Text style={styles.tagline}>{TAGLINE}</Text>

          <Text style={styles.headline}>지금 가입하면{'\n'}즉시 리워드 지급</Text>
          <Text style={styles.sub}>간편 가입하고 웰컴 GLAS를 바로 받아보세요. 결제수단은 나중에 무엇을 쓰든 상관없어요.</Text>

          <View style={styles.btnCol}>
            <Pressable style={styles.oauthBtn} onPress={() => startSignup('google')}>
              <Ionicons name="logo-google" size={16} color="#0B0B0D" />
              <Text style={styles.oauthBtnText}>Google로 계속하기</Text>
            </Pressable>
            <Pressable style={[styles.oauthBtn, styles.oauthBtnAlt]} onPress={() => startSignup('email')}>
              <Ionicons name="mail-outline" size={16} color={colors.text} />
              <Text style={[styles.oauthBtnText, styles.oauthBtnTextAlt]}>이메일로 계속하기</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {step === 'joining' && (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.accentViolet} size="large" />
          <Text style={styles.joiningText}>가입 처리 중...</Text>
        </View>
      )}

      {step === 'reward' && (
        <View style={styles.centerWrap}>
          <Animated.View entering={ZoomIn.duration(420).springify()}>
            <View style={styles.rewardIconWrap}>
              <LinearGradient colors={['#B18CFF', '#E8C468']} style={StyleSheet.absoluteFill} />
              <Ionicons name="gift" size={34} color="#0B0B0D" />
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(150)} style={styles.rewardAmount}>
            +{WELCOME_BONUS_GLAS} GLAS
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220)} style={styles.rewardTitle}>
            웰컴 리워드 지급 완료!
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(280)} style={styles.rewardSub}>
            GLASSY 멤버십이 시작됐어요. 이제 어떤 방식으로 결제하든 GLAS가 쌓여요.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(340)} style={{ width: '100%', marginTop: spacing.xl }}>
            <PillButton label="홈으로 이동" onPress={goHome} colors_={['#B18CFF', '#8C5CE0']} />
          </Animated.View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  introWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  qrBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232,196,104,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  scannedText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.accentGold, letterSpacing: 0.5 },
  brand: { fontFamily: fonts.display, fontSize: 30, color: colors.text, marginTop: spacing.xl, letterSpacing: 1 },
  tagline: { fontFamily: fonts.body, fontSize: 12, color: colors.textFaint, marginTop: 2 },
  headline: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 34,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
    maxWidth: 300,
  },
  btnCol: { width: '100%', gap: spacing.sm, marginTop: spacing.xxl },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
  },
  oauthBtnAlt: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.borderStrong },
  oauthBtnText: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: '#0B0B0D' },
  oauthBtnTextAlt: { color: colors.text },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  joiningText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.textMuted, marginTop: spacing.lg },
  rewardIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rewardAmount: { fontFamily: fonts.display, fontSize: 34, color: colors.accentGold, marginTop: spacing.xl },
  rewardTitle: { fontFamily: fonts.displaySemi, fontSize: 18, color: colors.text, marginTop: spacing.sm },
  rewardSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
    maxWidth: 300,
  },
});
