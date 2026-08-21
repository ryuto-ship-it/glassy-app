import { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

import { colors, fonts, radius, shadow, palette, APP_NAME } from '@/constants/theme';
import { TOKENOMICS_ALLOCATION } from '@/constants/tokenomics';
import TokenomicsChart from './TokenomicsChart';

const FLYOUT_WIDTH = 250;
const RAIL_GRADIENT = [colors.accentViolet, palette.rose] as const;

function XIcon({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4l7.3 8.6L4.4 20h2.3l6-6.9 4.9 6.9h4.1l-7.6-9.1L20.6 4h-2.3l-5.6 6.4L7.9 4z"
        fill={color}
      />
    </Svg>
  );
}

function TelegramIcon({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.4} />
      <Path
        d="M6.8 12.1l10-3.9c.5-.2.9.1.7.8l-1.7 8c-.1.5-.4.6-.8.4l-2.6-1.9-1.3 1.2c-.2.2-.4.1-.4-.2l.3-2.6 5-4.5c.2-.2 0-.3-.3-.1l-6.2 3.9-2.5-.8c-.5-.2-.5-.6.1-.8z"
        fill={color}
      />
    </Svg>
  );
}

function RailButton({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(0.92)} onPressOut={() => animateTo(1)} style={styles.railBtnHit}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <LinearGradient colors={RAIL_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.railBtn}>
          {children}
        </LinearGradient>
        <Text style={styles.railLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// The desktop-only vertical link-tree rail that flanks the phone frame once
// there's enough room (>=768px viewport). Rendered as a pair (side="left" /
// "right") from PhoneFrame.tsx, in place of the plain watermark at that
// breakpoint. Fully self-contained — no global store needed since nothing
// here needs to be reached from inside the app itself.
export function SidePanel({ side }: { side: 'left' | 'right' }) {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const flyoutAnim = useRef(new Animated.Value(0)).current;
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFlyout = () => {
    const next = !flyoutOpen;
    setFlyoutOpen(next);
    Animated.spring(flyoutAnim, { toValue: next ? 1 : 0, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
  };

  const showComingSoon = (label: string) => {
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    setComingSoon(label);
    comingSoonTimer.current = setTimeout(() => setComingSoon(null), 2000);
  };

  const entryOffset = side === 'left' ? -24 : 24;
  const flyoutTranslate = flyoutAnim.interpolate({ inputRange: [0, 1], outputRange: [entryOffset, 0] });

  return (
    <View style={[styles.wrap, side === 'left' ? styles.wrapLeft : styles.wrapRight]}>
      <View style={styles.rail}>
        <Text style={styles.railWordmark}>{APP_NAME}</Text>
        <RailButton onPress={() => showComingSoon('홈페이지 — 오픈 예정')} label="홈페이지">
          <Ionicons name="home-outline" size={17} color="#0B0B0D" />
        </RailButton>
        <RailButton onPress={toggleFlyout} label="토크노믹스">
          <Ionicons name="pie-chart-outline" size={16} color="#0B0B0D" />
        </RailButton>
        <RailButton onPress={() => showComingSoon('X (Twitter) — Coming Soon')} label="X">
          <XIcon size={13} color="#0B0B0D" />
        </RailButton>
        <RailButton onPress={() => showComingSoon('Telegram — Coming Soon')} label="텔레그램">
          <TelegramIcon size={15} color="#0B0B0D" />
        </RailButton>
      </View>

      {flyoutOpen && (
        <Animated.View
          style={[
            styles.flyout,
            side === 'left' ? { left: 96 } : { right: 96 },
            { opacity: flyoutAnim, transform: [{ translateX: flyoutTranslate }] },
          ]}
        >
          <View style={styles.flyoutCard}>
            <View style={styles.flyoutHeaderRow}>
              <Text style={styles.flyoutTitle}>$GLAS 토큰 분배</Text>
              <Pressable onPress={toggleFlyout} style={styles.flyoutCloseBtn} hitSlop={8}>
                <Ionicons name="close" size={12} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.flyoutSub}>예시 수치입니다 — 추후 실제 수치로 교체돼요.</Text>
            <TokenomicsChart data={TOKENOMICS_ALLOCATION} size={168} />
          </View>
        </Animated.View>
      )}

      {comingSoon && (
        <View style={styles.comingSoonBubble}>
          <Text style={styles.comingSoonText}>{comingSoon}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', width: 96, zIndex: 5 },
  wrapLeft: { left: 0 },
  wrapRight: { right: 0 },
  rail: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: colors.glassFill,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  railWordmark: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
    marginBottom: 2,
  },
  railBtnHit: { alignItems: 'center' },
  railBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  railLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: fonts.bodyMed,
    marginTop: 5,
    letterSpacing: 0.2,
  },
  flyout: {
    position: 'absolute',
    zIndex: 6,
    top: '50%',
    marginTop: -140,
  },
  flyoutCard: {
    width: FLYOUT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    ...shadow.lift,
  },
  flyoutHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flyoutTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  flyoutCloseBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.glassFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyoutSub: { fontSize: 10, color: colors.textMuted, marginTop: 3, marginBottom: 10, fontFamily: fonts.body },
  comingSoonBubble: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    maxWidth: 150,
  },
  comingSoonText: { color: colors.text, fontSize: 10.5, fontFamily: fonts.bodyBold, textAlign: 'center' },
});
