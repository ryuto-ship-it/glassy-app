import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { PillButton } from './PillButton';

type Props = {
  hasCompletedQuiz: boolean;
  topPickLabel?: string;
  matchScore?: number;
  isPrecision: boolean;
  onPress: () => void;
  // A CRM-style callback referencing a past purchase — when present, the
  // banner leads with this instead of the generic "오늘의 AI 매칭" line.
  historyInsight?: string | null;
};

// The home screen's hero — AI Health Intelligence is GLASSY's flagship
// feature, not a side widget, so this banner outranks every other card in
// size and visual energy (gradient glow + a continuously scanning light
// sweep) whether or not the user has diagnosed yet.
export function AiHeroBanner({ hasCompletedQuiz, topPickLabel, matchScore, isPrecision, onPress, historyInsight }: Props) {
  const sweep = useSharedValue(-1);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.linear }), -1);
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 1700 }), withTiming(0.6, { duration: 1700 })),
      -1,
      true
    );
  }, [sweep, glow]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value * 340 }, { rotate: '18deg' }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Pressable onPress={onPress} style={[styles.wrap, !hasCompletedQuiz && styles.wrapHero]}>
      <LinearGradient
        colors={['#2A1F3D', '#1D1A2E', '#0B0B0D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glowHalo, glowStyle]} />
      <Animated.View style={[styles.sweep, sweepStyle]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', 'rgba(177,140,255,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.kickerRow}>
          <Ionicons name="sparkles" size={13} color={colors.accentGold} />
          <Text style={styles.kicker}>AI 헬스 인텔리전스 · 실시간 분석</Text>
        </View>

        {!hasCompletedQuiz ? (
          <>
            <Text style={styles.heroTitle}>AI가 당신에게 맞는{'\n'}헬스케어를 찾아드립니다</Text>
            <Text style={styles.heroBody}>
              컨디션 몇 가지만 체크하면 개인 맞춤 인텔리전스가 분석해 지금 필요한 제품을 매칭해요.
            </Text>
            <PillButton
              label="AI 진단 시작하기"
              onPress={onPress}
              colors_={['#B18CFF', '#8C5CE0']}
              icon={<Ionicons name="scan-outline" size={15} color="#0B0B0D" />}
              style={{ marginTop: spacing.lg, alignSelf: 'flex-start' }}
            />
          </>
        ) : (
          <>
            <Text style={styles.summaryTitle}>{historyInsight ? '지난 구매 기반 이번엔 이걸 확인해보세요' : '당신을 위한 오늘의 AI 매칭'}</Text>
            {topPickLabel && (
              <Text style={styles.summaryBody} numberOfLines={1}>
                {topPickLabel} · 매칭 {matchScore}%
              </Text>
            )}
            <View style={styles.footerRow}>
              <View style={[styles.unlockChip, isPrecision && styles.unlockChipActive]}>
                <Ionicons
                  name={isPrecision ? 'lock-open-outline' : 'lock-closed-outline'}
                  size={11}
                  color={isPrecision ? '#0B0B0D' : colors.textFaint}
                />
                <Text style={[styles.unlockText, isPrecision && styles.unlockTextActive]}>
                  {isPrecision ? '정밀 분석 5축 활성' : 'Radiant Glass+ 정밀 분석 잠금'}
                </Text>
              </View>
              <Text style={styles.retakeText}>다시 진단하기 →</Text>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(177,140,255,0.3)',
    shadowColor: '#8C5CE0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  wrapHero: {
    borderColor: 'rgba(177,140,255,0.45)',
  },
  glowHalo: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 140,
    backgroundColor: 'rgba(177,140,255,0.22)',
  },
  sweep: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 100,
    left: -120,
  },
  content: { padding: spacing.xl },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.accentGold, letterSpacing: 0.5, textTransform: 'uppercase' },
  heroTitle: { fontFamily: fonts.display, fontSize: 24, color: '#FFFFFF', marginTop: spacing.md, lineHeight: 32 },
  heroBody: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: spacing.sm, lineHeight: 18 },
  summaryTitle: { fontFamily: fonts.displaySemi, fontSize: 17, color: '#FFFFFF', marginTop: spacing.sm },
  summaryBody: { fontFamily: fonts.bodyMed, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  unlockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  unlockChipActive: { backgroundColor: colors.accentGold },
  unlockText: { fontFamily: fonts.bodyMed, fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  unlockTextActive: { color: '#0B0B0D', fontFamily: fonts.bodyBold },
  retakeText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.accentViolet },
});
