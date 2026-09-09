import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { TRUST_QUOTES } from '@/data/trustQuotes';
import { GlassSurface } from './GlassSurface';

// 신뢰 신호 스포트라이트 — 참약사 약사 인증/실제 이용자 후기를 가로 스크롤로
// 보여준다 ("참약사 약사가 직접 검증한 추천입니다").
export function TrustSpotlight() {
  return (
    <View>
      <View style={styles.headerRow}>
        <Ionicons name="shield-checkmark" size={14} color={colors.accentBlue} />
        <Text style={styles.header}>참약사가 보증하는 신뢰</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.xl }}
      >
        {TRUST_QUOTES.map((q, i) => (
          <Animated.View key={q.id} entering={FadeInRight.delay(i * 90).duration(360)} style={{ width: 240 }}>
            <GlassSurface radius={radius.lg} padding={spacing.md} elevated>
              <View style={styles.row}>
                <Image source={{ uri: q.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{q.name}</Text>
                  <Text style={styles.role} numberOfLines={1}>{q.role}</Text>
                </View>
                {q.kind === 'pharmacist' && (
                  <View style={styles.verifiedChip}>
                    <Ionicons name="checkmark-circle" size={11} color="#0B0B0D" />
                  </View>
                )}
              </View>
              <Text style={styles.quote} numberOfLines={3}>&ldquo;{q.quote}&rdquo;</Text>
              {q.rating && (
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Ionicons
                      key={si}
                      name={si < q.rating! ? 'star' : 'star-outline'}
                      size={11}
                      color={colors.accentGold}
                    />
                  ))}
                </View>
              )}
            </GlassSurface>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  header: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  name: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.text },
  role: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, marginTop: 1 },
  verifiedChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: { fontFamily: fonts.bodyMed, fontSize: 11.5, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: spacing.sm },
});
