import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { RELATION_LABEL } from '@/data/family';
import { colors, fonts, spacing } from '@/constants/theme';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useUiStore } from '@/store/useUiStore';

// 참약사 "우리가족 건강 플랫폼 약국" — 가족 구성원 스와이프 셀렉터. 탭하면
// 홈 전체(AI 추천/진단/채팅 이력)가 해당 구성원 기준으로 전환된다.
export function FamilySelector() {
  const members = useFamilyStore((s) => s.members);
  const activeMemberId = useFamilyStore((s) => s.activeMemberId);
  const setActiveMember = useFamilyStore((s) => s.setActiveMember);
  const openAddFamily = useUiStore((s) => s.openAddFamily);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {members.map((m, i) => {
        const active = m.id === activeMemberId;
        return (
          <Animated.View key={m.id} entering={ZoomIn.delay(i * 60).duration(300)}>
            <Pressable onPress={() => setActiveMember(m.id)} style={styles.item}>
              <View style={[styles.avatarRing, active && styles.avatarRingActive]}>
                <Image source={{ uri: m.avatar }} style={styles.avatar} />
              </View>
              <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
                {m.relation === 'self' ? m.name : RELATION_LABEL[m.relation]}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
      <Animated.View entering={ZoomIn.delay(members.length * 60).duration(300)}>
        <Pressable onPress={openAddFamily} style={styles.item}>
          <View style={styles.addRing}>
            <Ionicons name="add" size={18} color={colors.accentBlue} />
          </View>
          <Text style={styles.name}>추가</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl },
  item: { alignItems: 'center', width: 58 },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingActive: { borderColor: colors.accentBlue },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  addRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
  },
  name: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, marginTop: 4 },
  nameActive: { color: colors.text, fontFamily: fonts.bodyBold },
});
