import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { CHAT_GREETING } from '@/data/chatRules';

// CHARM의 새로운 메인 엣지 기능 — AI 채팅 상담. 홈 화면 최상단, AI 진단
// 배너보다도 먼저 눈에 띄어야 해서 실제 채팅 인터페이스를 미리보기 형태로
// 노출한다: 최근 AI 인사말 프리뷰 + "AI에게 물어보세요" 입력창 목업(커서
// 계속 깜빡임) — 탭하지 않아도 이게 채팅 기능이라는 게 바로 보이도록.
export function AiChatEntryCard({ onPress }: { onPress: () => void }) {
  const float = useSharedValue(0);
  const cursor = useSharedValue(1);

  useEffect(() => {
    float.value = withRepeat(withSequence(withTiming(-5, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1, true);
    cursor.value = withRepeat(withSequence(withTiming(0, { duration: 530 }), withTiming(1, { duration: 530 })), -1, true);
  }, [float, cursor]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursor.value }));

  return (
    <Pressable testID="ai-chat-entry" onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <LinearGradient colors={['#1B5FA8', '#4FB6E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.glossHalo} />

      <View style={styles.row}>
        <Animated.View style={[styles.iconWrap, floatStyle]}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>AI 채팅 상담</Text>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveChipText}>지금 상담 가능</Text>
            </View>
          </View>
          <Text style={styles.sub}>오늘 컨디션을 편하게 물어보세요 · 참약사 약사와도 바로 연결돼요</Text>
        </View>
      </View>

      {/* 실제 채팅 화면처럼 보이는 미리보기 — 최근 AI 인사말 1줄 */}
      <View style={styles.previewBubbleRow}>
        <View style={styles.previewAvatar}>
          <Ionicons name="sparkles" size={11} color="#fff" />
        </View>
        <View style={styles.previewBubble}>
          <Text style={styles.previewBubbleText} numberOfLines={2}>
            {CHAT_GREETING}
          </Text>
        </View>
      </View>

      {/* 입력창 목업 — 탭하면 실제 채팅으로 진입, 커서가 계속 깜빡여서
          "지금 바로 타이핑하면 되는" 라이브 입력창처럼 보이게 한다 */}
      <View style={styles.mockInputRow}>
        <Text style={styles.mockInputPlaceholder}>AI에게 물어보세요</Text>
        <Animated.View style={[styles.mockCursor, cursorStyle]} />
        <View style={{ flex: 1 }} />
        <View style={styles.mockSendBtn}>
          <Ionicons name="arrow-up" size={14} color="#1B5FA8" />
        </View>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 17, color: '#FFFFFF' },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#6CF08A' },
  liveChipText: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#FFFFFF' },
  sub: { fontFamily: fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 3, lineHeight: 15 },
  previewBubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: spacing.lg },
  previewAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.md,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  previewBubbleText: { fontFamily: fonts.bodyMed, fontSize: 11.5, color: '#FFFFFF', lineHeight: 16 },
  mockInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  mockInputPlaceholder: { fontFamily: fonts.bodyMed, fontSize: 12.5, color: '#5B6B85' },
  mockCursor: { width: 1.5, height: 14, backgroundColor: '#1B5FA8', marginLeft: 3 },
  mockSendBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(27,95,168,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
