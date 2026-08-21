import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { GlassSurface } from './GlassSurface';
import { GradeBadge } from './GradeBadge';
import { TIERS } from '@/constants/glow';
import { colors, fonts, gradients, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export function LevelUpOverlay() {
  const levelUpTier = useAppStore((s) => s.levelUpTier);
  const clearLevelUp = useAppStore((s) => s.clearLevelUp);
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1);
  }, [rotate]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  if (!levelUpTier) return null;
  const tier = TIERS.find((t) => t.id === levelUpTier)!;
  const isTopTier = tier.id === 'glass-skin';

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.host} pointerEvents="box-none">
      <View style={styles.backdrop} />
      <Animated.View style={[styles.sweep, rotateStyle, isTopTier && styles.sweepBig]}>
        <LinearGradient
          colors={gradients.holo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.cardWrap}>
        <GlassSurface strong padding={spacing.xxl} radius={radius.xl} style={styles.card}>
          <View style={styles.badgeHalo}>
            <GradeBadge tier={tier.id} size={104} />
          </View>
          <Text style={styles.kicker}>{isTopTier ? '최상위 등급 달성' : '피부 광채가 차올랐어요'}</Text>
          <Text style={[styles.tierName, { color: tier.accent }]}>{tier.name}</Text>
          <Text style={styles.tagline}>{tier.tagline}</Text>

          <View style={styles.benefitBox}>
            {tier.benefits.slice(0, 2).map((b) => (
              <View key={b} style={styles.benefitRow}>
                <Text style={styles.benefitDot}>✦</Text>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          <Pressable style={[styles.cta, { backgroundColor: tier.accent }]} onPress={clearLevelUp}>
            <Text style={styles.ctaText}>Glow up 확인</Text>
          </Pressable>
        </GlassSurface>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(74,46,78,0.28)',
  },
  sweep: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.35,
  },
  sweepBig: {
    width: 800,
    height: 800,
    borderRadius: 400,
    opacity: 0.45,
  },
  cardWrap: {
    width: '86%',
    maxWidth: 360,
  },
  card: {
    alignItems: 'center',
  },
  badgeHalo: {
    marginBottom: spacing.md,
  },
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tierName: {
    fontFamily: fonts.display,
    fontSize: 28,
    marginTop: 4,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  benefitBox: {
    marginTop: spacing.lg,
    width: '100%',
    gap: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  benefitDot: {
    color: colors.accentLavender,
    fontSize: 12,
    marginTop: 1,
  },
  benefitText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  cta: {
    marginTop: spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: radius.pill,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
