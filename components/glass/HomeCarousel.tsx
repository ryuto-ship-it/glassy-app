import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, Easing, PanResponder, LayoutChangeEvent, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';

import { fonts, radius, shadow, palette } from '@/constants/theme';

export type HomeSlide = {
  key: string;
  gradient: readonly [string, string];
  eyebrow: string;
  title: string;
  caption: string;
  icon: string;
  // Optional muted/looping video background instead of the flat gradient —
  // see assets/videos/README.md, it's a placeholder clip today.
  video?: number;
};

const AUTOPLAY_MS = 4500;
const RESUME_DELAY_MS = 6000;
const SWIPE_THRESHOLD = 0.2;

export const HOME_SLIDES: HomeSlide[] = [
  {
    key: 'promo',
    gradient: [palette.violetDeep, palette.violet],
    eyebrow: '신규 프로모션',
    title: '이달의 공동구매, 최대 15% 추가 할인',
    caption: '지금 참여 중인 공동구매에 합류하고 정가보다 훨씬 저렴하게 받아보세요.',
    icon: '🛍️',
  },
  {
    key: 'newin',
    gradient: [palette.goldDeep, palette.gold],
    eyebrow: '신제품 입고',
    title: '이번 주 새로 들어온 K-beauty 신제품',
    caption: '약국 탭에서 가장 먼저 신제품을 만나보세요.',
    icon: '✨',
  },
  {
    key: 'upgrade',
    gradient: [palette.violet, palette.gold],
    eyebrow: '등급 업그레이드',
    title: '다음 등급까지 얼마 안 남았어요',
    caption: "'지금 바로 구매'로 락업 없이 즉시 다음 등급을 달성해보세요.",
    icon: '🚀',
  },
  {
    key: 'community',
    gradient: ['#3FAE9C', palette.teal],
    eyebrow: '커뮤니티 소식',
    title: 'Glow Feed에서 지금 가장 인기있는 후기',
    caption: '실제 회원들의 솔직한 후기를 보고 GLAS 리워드 획득 현황도 확인해보세요.',
    icon: '💬',
    video: require('../../assets/videos/hero-placeholder.mp4'),
  },
];

function FloatingBlob({ style, phase = 0 }: { style: any; phase?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3400 + phase * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3400 + phase * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, phase]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return <Animated.View style={[style, { transform: [{ translateY }, { scale }] }]} />;
}

function FloatingIcon({ emoji }: { emoji: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });

  return (
    <Animated.Text style={[styles.floatingIcon, { transform: [{ translateY }, { rotate }] }]}>
      {emoji}
    </Animated.Text>
  );
}

function VideoSlideBackground({ source, active }: { source: number; active: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  // expo-video's web-only .d.ts expects a narrower VideoPlayerWeb type here
  // than useVideoPlayer's cross-platform return type — a type-declaration
  // mismatch in the library itself, not a real runtime issue.
  return <VideoView player={player as any} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

function SlideCard({ slide, width, active }: { slide: HomeSlide; width: number; active: boolean }) {
  const eyebrowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const captionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    eyebrowAnim.setValue(0);
    titleAnim.setValue(0);
    captionAnim.setValue(0);
    Animated.stagger(110, [
      Animated.timing(eyebrowAnim, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(captionAnim, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [active, eyebrowAnim, titleAnim, captionAnim]);

  const fadeUp = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <View style={[styles.slide, { width: width || undefined }]}>
      {slide.video ? (
        <>
          <VideoSlideBackground source={slide.video} active={active} />
          <LinearGradient
            colors={['rgba(11,11,13,0.25)', 'rgba(11,11,13,0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <FloatingBlob style={[styles.blob, styles.blobBig]} phase={0} />
      <FloatingBlob style={[styles.blob, styles.blobSmall]} phase={1} />
      <FloatingIcon emoji={slide.icon} />
      <Animated.Text style={[styles.eyebrow, fadeUp(eyebrowAnim)]}>{slide.eyebrow}</Animated.Text>
      <Animated.Text style={[styles.title, fadeUp(titleAnim)]} numberOfLines={3}>
        {slide.title}
      </Animated.Text>
      <Animated.Text style={[styles.caption, fadeUp(captionAnim)]} numberOfLines={2}>
        {slide.caption}
      </Animated.Text>
    </View>
  );
}

// Auto-rolling promo carousel for the home screen's very first banner slot
// (promotion / new-in / tier-upgrade nudge / community, one backed by a
// real muted+looping video) — distinct from AiHeroBanner right below it,
// which stays the app's dedicated AI diagnosis hero.
export function HomeCarousel({ slides = HOME_SLIDES }: { slides?: HomeSlide[] }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const widthRef = useRef(0);
  const baseOffsetRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== widthRef.current) {
      widthRef.current = w;
      setWidth(w);
      translateX.setValue(-indexRef.current * w);
    }
  };

  const goTo = (nextIndex: number, animated = true) => {
    const clamped = ((nextIndex % slides.length) + slides.length) % slides.length;
    indexRef.current = clamped;
    setIndex(clamped);
    if (animated) {
      Animated.spring(translateX, { toValue: -clamped * widthRef.current, useNativeDriver: false, bounciness: 6, speed: 14 }).start();
    } else {
      translateX.setValue(-clamped * widthRef.current);
    }
  };

  const pauseThenResume = () => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      goTo(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          pauseThenResume();
          baseOffsetRef.current = (translateX as any).__getValue();
        },
        onPanResponderMove: (_, g) => {
          translateX.setValue(baseOffsetRef.current + g.dx);
        },
        onPanResponderRelease: (_, g) => {
          const threshold = widthRef.current * SWIPE_THRESHOLD;
          if (g.dx < -threshold) goTo(indexRef.current + 1);
          else if (g.dx > threshold) goTo(indexRef.current - 1);
          else goTo(indexRef.current);
          pauseThenResume();
        },
        onPanResponderTerminate: () => {
          goTo(indexRef.current);
          pauseThenResume();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={styles.clip} {...panResponder.panHandlers}>
        {width > 0 ? (
          <Animated.View style={[styles.track, { width: width * slides.length, transform: [{ translateX }] }]}>
            {slides.map((slide, i) => (
              <SlideCard key={slide.key} slide={slide} width={width} active={i === index} />
            ))}
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.dotsRow}>
        {slides.map((slide, i) => (
          <View
            key={slide.key}
            onTouchEnd={() => {
              goTo(i);
              pauseThenResume();
            }}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, overflow: 'hidden', ...shadow.lift },
  clip: { overflow: 'hidden', cursor: 'grab', userSelect: 'none' } as any,
  track: { flexDirection: 'row' },
  slide: { padding: 20, paddingTop: 22, paddingBottom: 36, height: 210, position: 'relative', overflow: 'hidden', userSelect: 'none' } as any,
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' },
  blobBig: { width: 200, height: 200, top: -80, right: -60 },
  blobSmall: { width: 110, height: 110, top: 30, right: 40 },
  floatingIcon: { position: 'absolute', bottom: 16, right: 20, fontSize: 34, opacity: 0.55 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 10.5, letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)' },
  title: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, color: '#FFFFFF', marginTop: 9, marginBottom: 10, maxWidth: '78%' },
  caption: { fontSize: 10.5, lineHeight: 14.5, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontFamily: fonts.body, maxWidth: '80%' },
  dotsRow: {
    position: 'absolute', bottom: 12, left: 20, flexDirection: 'row', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 16, backgroundColor: '#FFFFFF' },
});
