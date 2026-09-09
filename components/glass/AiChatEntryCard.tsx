import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/constants/theme';

// 참약사이기 때문에 가능한 기능 — AI 1차 상담 후 참약사 약사에게 바로
// 이어지는 채팅 상담 진입 카드. 홈 화면 최상단부 벤토 grid의 large 셀.
export function AiChatEntryCard({ onPress }: { onPress: () => void }) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withSequence(withTiming(-5, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1, true);
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <Pressable testID="ai-chat-entry" onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <LinearGradient colors={['#1B5FA8', '#4FB6E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.glossHalo} />
      <View style={styles.row}>
        <Animated.View style={[styles.iconWrap, floatStyle]}>
          <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>AI 채팅 상담</Text>
          <Text style={styles.sub}>오늘 컨디션을 편하게 물어보세요 · 참약사 약사와도 바로 연결돼요</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.85)" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    shadowColor: '#1B5FA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  glossHalo: {
    position: 'absolute',
    top: -50,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 17, color: '#FFFFFF' },
  sub: { fontFamily: fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 3, lineHeight: 15 },
});
