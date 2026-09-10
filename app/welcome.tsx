import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { CharmacistLogo } from '@/components/glass/CharmacistLogo';
import { CinematicIntro } from '@/components/glass/CinematicIntro';
import { ConfettiBurst } from '@/components/glass/ConfettiBurst';
import { FloatingBlobs } from '@/components/glass/FloatingBlobs';
import { PillButton } from '@/components/glass/PillButton';
// Kept on the dark theme deliberately — a dramatic, distinct "store entry"
// moment regardless of the app's light default elsewhere.
import { darkBackgroundGradient, darkColors as colors, fonts, radius, spacing, TAGLINE } from '@/constants/theme';
import { DarkScope } from '@/constants/themeScope';
import { WELCOME_BONUS_CHARM, useAppStore } from '@/store/useAppStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useUiStore } from '@/store/useUiStore';

type Step = 'cinematic' | 'intro' | 'joining' | 'reward' | 'family-check';

// Subtle "look here" pulse on the primary CTA — a ~2.6s breathing scale,
// off entirely under reduce-motion.
function usePulseStyle() {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [reducedMotion, scale]);

  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

// The "매장 입구 웰컴 게이트웨이" — the mocked entry point for a customer
// who just scanned a store QR and is signing up for the first time. Shown
// automatically once per app session (see app/(tabs)/index.tsx) and
// replayable anytime from Profile → "웰컴 플로우 다시보기" for demos.
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('cinematic');
  const markWelcomeSeen = useUiStore((s) => s.markWelcomeSeen);
  const openAddFamily = useUiStore((s) => s.openAddFamily);
  const claimWelcomeBonus = useAppStore((s) => s.claimWelcomeBonus);
  const setTravelingWithFamily = useFamilyStore((s) => s.setTravelingWithFamily);
  const pulseStyle = usePulseStyle();

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

  // Deliberately router.replace (not router.back()) — the previous history
  // entry can be the literal "/index.html" URL (this app is a static
  // multi-page export), which the client router fails to match back to the
  // index route, landing on not-found. Replacing with the clean root path
  // sidesteps that mismatch entirely.
  const goHome = () => router.replace('/');

  const chooseTravelMode = (withFamily: boolean) => {
    setTravelingWithFamily(withFamily);
    if (withFamily) openAddFamily();
    goHome();
  };

  if (step === 'cinematic') {
    return (
      <DarkScope>
        <View style={[styles.root, { paddingTop: insets.top }]}>
          <CinematicIntro onDone={() => setStep('intro')} />
        </View>
      </DarkScope>
    );
  }

  return (
    <DarkScope>
    <LinearGradient colors={darkBackgroundGradient} style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <FloatingBlobs />
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

          <Animated.View entering={ZoomIn.delay(150).duration(500).springify().damping(13)} style={{ marginTop: spacing.lg }}>
            <CharmacistLogo size={40} chip />
          </Animated.View>
          <Animated.Text entering={FadeIn.delay(450).duration(400)} style={styles.partnerLine}>
            참약사와 함께하는 CHARM
          </Animated.Text>
          <Animated.Text entering={ZoomIn.delay(600).duration(550).springify().damping(14)} style={styles.brand}>
            CHARM
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(900).duration(400)} style={styles.tagline}>
            {TAGLINE}
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(1000).duration(450)} style={styles.headline}>
            지금 가입하면{'\n'}즉시 리워드 지급
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(1100).duration(450)} style={styles.sub}>
            간편 가입하고 웰컴 CHARM을 바로 받아보세요. 결제수단은 나중에 무엇을 쓰든 상관없어요.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(1250).duration(450)} style={styles.btnCol}>
            <Animated.View style={pulseStyle}>
              <Pressable style={styles.oauthBtn} onPress={() => startSignup('google')}>
                <Ionicons name="logo-google" size={16} color="#0B0B0D" />
                <Text style={styles.oauthBtnText}>Google로 계속하기</Text>
              </Pressable>
            </Animated.View>
            <Pressable style={[styles.oauthBtn, styles.oauthBtnAlt]} onPress={() => startSignup('email')}>
              <Ionicons name="mail-outline" size={16} color={colors.text} />
              <Text style={[styles.oauthBtnText, styles.oauthBtnTextAlt]}>이메일로 계속하기</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {step === 'joining' && (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.accentBlue} size="large" />
          <Text style={styles.joiningText}>가입 처리 중...</Text>
        </View>
      )}

      {step === 'reward' && (
        <View style={styles.centerWrap}>
          <ConfettiBurst trigger="welcome-reward" />
          <Animated.View entering={ZoomIn.duration(420).springify()}>
            <View style={styles.rewardIconWrap}>
              <LinearGradient colors={['#4FB6E8', '#E8C468']} style={StyleSheet.absoluteFill} />
              <Ionicons name="gift" size={34} color="#0B0B0D" />
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(150)} style={styles.rewardAmount}>
            +{WELCOME_BONUS_CHARM} CHARM
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220)} style={styles.rewardTitle}>
            웰컴 리워드 지급 완료!
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(280)} style={styles.rewardSub}>
            CHARM 멤버십이 시작됐어요. 이제 어떤 방식으로 결제하든 CHARM이 쌓여요.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(340)} style={{ width: '100%', marginTop: spacing.xl }}>
            <PillButton label="다음" onPress={() => setStep('family-check')} colors_={['#4FB6E8', '#1B5FA8']} />
          </Animated.View>
        </View>
      )}

      {step === 'family-check' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.centerWrap}>
          <Ionicons name="people-circle-outline" size={40} color={colors.accentBlue} />
          <Text style={styles.familyQTitle}>혼자 여행 중이신가요,{'\n'}가족과 함께이신가요?</Text>
          <Text style={styles.familyQSub}>참약사는 우리가족 건강 플랫폼 약국이에요 — 가족 구성원별로 AI 추천을 따로 관리할 수 있어요.</Text>
          <View style={styles.familyBtnCol}>
            <Pressable style={styles.familyChoiceBtn} onPress={() => chooseTravelMode(true)}>
              <Ionicons name="people" size={16} color="#0B0B0D" />
              <Text style={styles.familyChoiceBtnText}>가족과 함께예요</Text>
            </Pressable>
            <Pressable style={[styles.familyChoiceBtn, styles.familyChoiceBtnAlt]} onPress={() => chooseTravelMode(false)}>
              <Ionicons name="person" size={16} color={colors.text} />
              <Text style={[styles.familyChoiceBtnText, styles.familyChoiceBtnTextAlt]}>혼자 여행 중이에요</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </LinearGradient>
    </DarkScope>
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
  scannedText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.accentGold, letterSpacing: 0.5, textAlign: 'center' },
  partnerLine: {
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  brand: { fontFamily: fonts.display, fontSize: 30, color: colors.text, marginTop: spacing.sm, letterSpacing: 1, textAlign: 'center' },
  tagline: { fontFamily: fonts.body, fontSize: 12, color: colors.textFaint, marginTop: 2, textAlign: 'center' },
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
  joiningText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' },
  rewardIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rewardAmount: { fontFamily: fonts.display, fontSize: 34, color: colors.accentGold, marginTop: spacing.xl, textAlign: 'center' },
  rewardTitle: { fontFamily: fonts.displaySemi, fontSize: 18, color: colors.text, marginTop: spacing.sm, textAlign: 'center' },
  rewardSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
    maxWidth: 300,
  },
  familyQTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 30,
  },
  familyQSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
    maxWidth: 300,
  },
  familyBtnCol: { width: '100%', gap: spacing.sm, marginTop: spacing.xxl },
  familyChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accentGold,
  },
  familyChoiceBtnAlt: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.borderStrong },
  familyChoiceBtnText: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: '#0B0B0D' },
  familyChoiceBtnTextAlt: { color: colors.text },
});
