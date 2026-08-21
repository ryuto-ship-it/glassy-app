import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { GlassSurface } from './GlassSurface';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

function ToastItem({
  message,
  glasAmount,
  onDone,
}: {
  message: string;
  glasAmount?: number;
  onDone: () => void;
}) {
  const sweep = useSharedValue(-1);

  useEffect(() => {
    sweep.value = withDelay(150, withTiming(1, { duration: 950 }));
    const timer = setTimeout(onDone, 2700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value * 220 }, { rotate: '18deg' }],
  }));

  return (
    <Animated.View entering={FadeInDown.springify().damping(14)} exiting={FadeOutUp} style={styles.itemWrap}>
      <GlassSurface strong radius={radius.pill} padding={0} style={styles.surface}>
        <View style={styles.row}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.msg} numberOfLines={1}>
            {message}
          </Text>
          {glasAmount ? <Text style={styles.amt}>+{glasAmount} GLAS</Text> : null}
        </View>
        <Animated.View style={[styles.sweep, sweepStyle]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.75)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </GlassSurface>
    </Animated.View>
  );
}

export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const insets = useSafeAreaInsets();

  if (!toasts.length) return null;

  return (
    <View style={[styles.host, { top: insets.top + 8 }]} pointerEvents="box-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} glasAmount={t.glasAmount} onDone={() => dismissToast(t.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  itemWrap: {
    width: '92%',
    maxWidth: 420,
  },
  surface: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emoji: { fontSize: 16 },
  msg: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: 13,
  },
  amt: {
    fontFamily: fonts.bodyBold,
    color: colors.danger,
    fontSize: 13,
  },
  sweep: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 60,
    left: -40,
  },
});
