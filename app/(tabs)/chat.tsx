import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { ProductImage } from '@/components/glass/ProductImage';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { CHAT_FALLBACK_REPLY, CHAT_GREETING, matchChatRule, PHARMACIST_HANDOFF_LABEL } from '@/data/chatRules';
import { PRODUCTS } from '@/data/mock';
import { PHARMACIST_PROFILE, PHARMACIST_REPLIES, PHARMACIST_SUMMARY_PREFIX } from '@/data/pharmacist';
import { formatUsd } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

// Matches the floating tab bar's height in app/(tabs)/_layout.tsx. That bar
// is position:absolute and paints over this screen's content, so the fixed
// input row needs this much extra bottom clearance or the tab bar hides it.
const TAB_BAR_HEIGHT = 78;

type Sender = 'ai' | 'user' | 'pharmacist';
type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  productIds?: string[];
  timeLabel?: string;
};

let msgSeq = 0;
function newId(prefix: string) {
  msgSeq += 1;
  return `${prefix}-${msgSeq}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ startPharmacist?: string; fromDiagnosis?: string }>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const pushToast = useAppStore((s) => s.pushToast);

  const [mode, setMode] = useState<'ai' | 'pharmacist'>('ai');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const userTextsRef = useRef<string[]>([]);

  useEffect(() => {
    if (params.startPharmacist) {
      userTextsRef.current.push(
        params.fromDiagnosis ? 'AI 진단 결과 기준 상담' : '컨디션 상담'
      );
      const t = setTimeout(() => switchToPharmacist(), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setMessages([{ id: newId('ai'), sender: 'ai', text: CHAT_GREETING }]);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    userTextsRef.current.push(text);
    setMessages((m) => [...m, { id: newId('user'), sender: 'user', text }]);
    setTyping(true);
    setTimeout(() => {
      const rule = matchChatRule(text);
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: newId('ai'),
          sender: 'ai',
          text: rule?.reply ?? CHAT_FALLBACK_REPLY,
          productIds: rule?.productIds,
        },
      ]);
      setExchangeCount((c) => c + 1);
    }, 900);
  };

  const switchToPharmacist = () => {
    setMode('pharmacist');
    const summary =
      userTextsRef.current.length > 0
        ? `${PHARMACIST_SUMMARY_PREFIX}: "${userTextsRef.current.slice(-2).join(', ')}"`
        : `${PHARMACIST_SUMMARY_PREFIX}.`;
    setMessages((m) => [
      ...m,
      { id: newId('sys'), sender: 'ai', text: summary },
      ...PHARMACIST_REPLIES.map((r, i) => ({
        id: newId('pharm'),
        sender: 'pharmacist' as const,
        text: r.text,
        timeLabel: i === 0 ? '방금 전' : `${Math.max(1, Math.round(r.delaySec / 60))}분 전`,
      })),
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        {mode === 'ai' ? (
          <View style={styles.headerCenter}>
            <View style={styles.aiAvatarSmall}>
              <Ionicons name="sparkles" size={13} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>CHARM AI 상담</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI 1차 상담</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.headerCenter}>
            <Image source={{ uri: PHARMACIST_PROFILE.avatar }} style={styles.pharmacistAvatarSmall} />
            <View>
              <Text style={styles.headerTitle}>{PHARMACIST_PROFILE.name}</Text>
              <View style={styles.pharmacistBadge}>
                <Ionicons name="ribbon" size={9} color="#0B0B0D" />
                <Text style={styles.pharmacistBadgeText}>{PHARMACIST_PROFILE.badge}</Text>
              </View>
            </View>
          </View>
        )}
        <View style={{ width: 32 }} />
      </View>

      {mode === 'pharmacist' && (
        <Animated.View entering={FadeInDown.duration(320)} style={styles.timelineRow}>
          <TimelineStep icon="sparkles" label="AI 1차 분석" done />
          <View style={styles.timelineLine} />
          <TimelineStep icon="medkit" label="참약사 약사 확인" done active />
        </Animated.View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onAddToCart={(id) => {
              const p = PRODUCTS.find((pp) => pp.id === id);
              if (p) pushToast(`장바구니에 담았어요 — ${p.name}`);
            }} />
          ))}

          {typing && <TypingBubble />}

          {mode === 'ai' && exchangeCount >= 1 && (
            <Animated.View entering={FadeInUp.duration(320)} style={styles.handoffWrap}>
              <Pressable testID="pharmacist-handoff" onPress={switchToPharmacist} style={styles.handoffBtn}>
                <Ionicons name="medkit-outline" size={14} color={colors.accentBlue} />
                <Text style={styles.handoffBtnText}>{PHARMACIST_HANDOFF_LABEL}</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.accentBlue} />
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>

        {mode === 'ai' && (
          <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, spacing.md) + TAB_BAR_HEIGHT }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="컨디션을 편하게 말씀해주세요..."
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <Pressable onPress={send} style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} disabled={!input.trim()}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function TimelineStep({
  icon,
  label,
  done,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <View style={styles.timelineStep}>
      <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]}>
        <Ionicons name={done ? 'checkmark' : icon} size={12} color={done ? '#0B0B0D' : colors.textFaint} />
      </View>
      <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>{label}</Text>
    </View>
  );
}

function MessageBubble({
  msg,
  onAddToCart,
}: {
  msg: ChatMessage;
  onAddToCart: (productId: string) => void;
}) {
  const isUser = msg.sender === 'user';
  const isPharmacist = msg.sender === 'pharmacist';
  const products = msg.productIds?.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as
    | typeof PRODUCTS
    | undefined;

  return (
    <Animated.View
      entering={ZoomIn.duration(320).springify().damping(15)}
      style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}
    >
      {!isUser && (
        <View style={styles.bubbleAvatarCol}>
          {isPharmacist ? (
            <Image source={{ uri: PHARMACIST_PROFILE.avatar }} style={styles.bubbleAvatarImg} />
          ) : (
            <View style={styles.bubbleAvatarAi}>
              <Ionicons name="sparkles" size={12} color="#fff" />
            </View>
          )}
        </View>
      )}
      <View style={{ flex: 1, maxWidth: '82%', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {isUser ? (
          <View style={styles.bubbleUser}>
            <Text style={styles.bubbleUserText}>{msg.text}</Text>
          </View>
        ) : isPharmacist ? (
          <View style={styles.bubblePharmacist}>
            <Text style={styles.bubblePharmacistText}>{msg.text}</Text>
            {msg.timeLabel && <Text style={styles.bubbleTimeLabel}>{msg.timeLabel}</Text>}
          </View>
        ) : (
          <LinearGradient colors={['#4FB6E8', '#1B5FA8']} style={styles.bubbleAi} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.bubbleAiText}>{msg.text}</Text>
          </LinearGradient>
        )}

        {products && products.length > 0 && (
          <View style={styles.productRow}>
            {products.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <ProductImage product={p} style={styles.productImg} />
                <Text style={styles.productName} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={styles.productPrice}>{formatUsd(p.priceUSD)}</Text>
                <Pressable onPress={() => onAddToCart(p.id)} style={styles.addBtn}>
                  <Ionicons name="bag-add-outline" size={11} color="#0B0B0D" />
                  <Text style={styles.addBtnText}>장바구니 담기</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function TypingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.bubbleRow}>
      <View style={styles.bubbleAvatarCol}>
        <View style={styles.bubbleAvatarAi}>
          <Ionicons name="sparkles" size={12} color="#fff" />
        </View>
      </View>
      <View style={styles.typingBubble}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </Animated.View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 350, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 350, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[styles.typingDot, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
  },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  aiAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacistAvatarSmall: { width: 30, height: 30, borderRadius: 15 },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(79,182,232,0.14)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  aiBadgeText: { fontFamily: fonts.bodyBold, fontSize: 8.5, color: colors.accentBlue },
  pharmacistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentGold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  pharmacistBadgeText: { fontFamily: fonts.bodyBold, fontSize: 8.5, color: '#0B0B0D' },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceRaised,
  },
  timelineStep: { alignItems: 'center', gap: 4, width: 90 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  timelineDotActive: { backgroundColor: colors.accentGold, borderColor: colors.accentGold },
  timelineLine: { flex: 1, height: 1, backgroundColor: colors.borderStrong, marginBottom: 16 },
  timelineLabel: { fontFamily: fonts.bodyMed, fontSize: 9.5, color: colors.textMuted, textAlign: 'center' },
  timelineLabelActive: { color: colors.text, fontFamily: fonts.bodyBold },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  bubbleRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleAvatarCol: { width: 26 },
  bubbleAvatarAi: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleAvatarImg: { width: 26, height: 26, borderRadius: 13 },
  bubbleAi: {
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    shadowColor: '#1B5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  bubbleAiText: { fontFamily: fonts.bodyMed, fontSize: 13, color: '#FFFFFF', lineHeight: 19 },
  bubblePharmacist: {
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(232,196,104,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.35)',
  },
  bubblePharmacistText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.text, lineHeight: 19 },
  bubbleTimeLabel: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textFaint, marginTop: 4 },
  bubbleUser: {
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUserText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.text, lineHeight: 19 },
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textFaint },
  productRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  productCard: {
    width: 108,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  productImg: { width: '100%', height: 64, borderRadius: radius.sm },
  productName: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.text, marginTop: 6, minHeight: 26 },
  productPrice: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: colors.accentGold,
    borderRadius: radius.pill,
    paddingVertical: 5,
    marginTop: 6,
  },
  addBtnText: { fontFamily: fonts.bodyBold, fontSize: 8.5, color: '#0B0B0D' },
  handoffWrap: { alignItems: 'center', marginTop: spacing.sm },
  handoffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(79,182,232,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79,182,232,0.35)',
  },
  handoffBtnText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.accentBlue },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
