import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CharmacistLogo } from './CharmacistLogo';
import { CountUpText } from './CountUpText';
import { FloatingBlobs } from './FloatingBlobs';
import { fonts, spacing } from '@/constants/theme';

const AUTO_ADVANCE_MS = 2800;

const STATS = [
  { icon: 'storefront-outline' as const, value: 200, suffix: '+', label: '전국 매장과 연결' },
  { icon: 'sparkles-outline' as const, value: 1200000, label: '누적 리워드 지급', formatter: (n: number) => `${(n / 1_000_000).toFixed(1)}M CHARM` },
  { icon: 'earth-outline' as const, value: 12, suffix: '개국', label: '이용자' },
];

// 참약사 실제 카피("대한민국이 신뢰하는 약국")를 인용한 브랜드 시네마틱
// 인트로. 실제 참약사 공식 영상 파일은 이 프로젝트에 없어서(플레이스홀더
// CC0 클립만 존재) 대신 브랜드 컬러 기반 애니메이션 배경으로 구성했다 —
// 실제 영상이 확보되면 이 컴포넌트의 배경을 영상으로 교체하면 된다.
export function CinematicIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Animated.View exiting={FadeIn.duration(1)} style={styles.root}>
      <LinearGradient colors={['#0A0F1C', '#0E2A44', '#0A0F1C']} style={StyleSheet.absoluteFill} />
      <FloatingBlobs />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFill} />
      </View>

      <Pressable onPress={onDone} style={styles.skipBtn} hitSlop={10}>
        <Text style={styles.skipText}>건너뛰기</Text>
        <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.8)" />
      </Pressable>

      <View style={styles.center}>
        <Animated.View entering={FadeIn.delay(150).duration(500)}>
          <CharmacistLogo size={44} chip />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(500).duration(600)} style={styles.copy}>
          대한민국이{'\n'}신뢰하는 약국
        </Animated.Text>

        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <Animated.View key={s.label} entering={FadeInDown.delay(1300 + i * 150).duration(500)} style={styles.statCol}>
              <Ionicons name={s.icon} size={16} color="#4FB6E8" />
              <CountUpText
                value={s.value}
                duration={1200}
                formatter={s.formatter ?? ((n) => `${Math.round(n).toLocaleString()}${s.suffix ?? ''}`)}
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>{s.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  skipBtn: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 2,
  },
  skipText: { fontFamily: fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  center: { alignItems: 'center', paddingHorizontal: spacing.xxl },
  copy: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginTop: spacing.lg,
  },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xxxl },
  statCol: { alignItems: 'center', gap: 4, maxWidth: 92 },
  statValue: { fontFamily: fonts.display, fontSize: 17, color: '#FFFFFF', textAlign: 'center' },
  statLabel: { fontFamily: fonts.bodyMed, fontSize: 9.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 12 },
});
