import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/glass/AppBackground';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GradeBadge } from '@/components/glass/GradeBadge';
import { TabFade } from '@/components/glass/TabFade';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { LANGUAGE_LABEL, LanguageCode, USER } from '@/data/mock';
import { formatDateShort } from '@/lib/date';
import { useTierStatus } from '@/lib/useTierStatus';
import { useAppStore } from '@/store/useAppStore';

const LANGUAGES: LanguageCode[] = ['en', 'zh', 'vi', 'ko'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tier } = useTierStatus();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <View style={styles.root}>
      <AppBackground />
      <TabFade>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 140 }}>
          <View style={styles.section}>
            <Text style={styles.pageTitle}>프로필</Text>
          </View>

          <View style={styles.section}>
            <GlassSurface elevated radius={radius.xl} padding={spacing.xl}>
              <View style={styles.headRow}>
                <Image source={{ uri: USER.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{USER.name}</Text>
                  <Text style={styles.location}>
                    {USER.countryFlag} {USER.location}
                  </Text>
                  <View style={styles.tierRow}>
                    <GradeBadge tier={tier.id} size={18} />
                    <Text style={[styles.tierName, { color: tier.accent }]}>{tier.name}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.profileMetaRow}>
                <MetaChip label={USER.gender} />
                <MetaChip label={USER.ageBand} />
                <MetaChip label={`가입일 ${formatDateShort(USER.memberSince)}`} />
              </View>
            </GlassSurface>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>스캔 · 번역 언어</Text>
            <GlassSurface radius={radius.lg} padding={spacing.lg}>
              <Text style={styles.langHint}>제품 스캔 결과와 번역이 이 언어로 표시돼요.</Text>
              <View style={styles.langRow}>
                {LANGUAGES.map((lng) => (
                  <Pressable key={lng} onPress={() => setLanguage(lng)} style={{ flex: 1 }}>
                    <View style={[styles.langChip, language === lng && styles.langChipActive]}>
                      <Text style={[styles.langChipText, language === lng && styles.langChipTextActive]}>
                        {LANGUAGE_LABEL[lng]}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </GlassSurface>
          </View>

          <View style={styles.section}>
            <GlassSurface radius={radius.lg} padding={0}>
              <ProfileRow
                icon="sparkles-outline"
                label="웰컴 플로우 다시보기"
                sub="매장 입구 가입 화면 데모"
                onPress={() => router.push('/welcome')}
              />
              <ProfileRow icon="scan-outline" label="제품 스캔" sub="카메라 스캔 데모로 이동" onPress={() => router.push('/scan')} />
              <ProfileRow icon="pulse-outline" label="내 컨디션" sub="웨어러블 연동 · AI 컨디션 분석" onPress={() => router.push('/wearable')} />
              <ProfileRow icon="notifications-outline" label="알림 설정" sub="곧 제공될 예정" last onPress={() => {}} />
            </GlassSurface>
          </View>

          <View style={styles.section}>
            <Pressable onPress={() => router.push('/admin')} style={styles.adminLink}>
              <Ionicons name="bar-chart-outline" size={13} color={colors.textFaint} />
              <Text style={styles.adminLinkText}>매장 관리자 뷰</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.textFaint} />
            </Pressable>
          </View>
        </ScrollView>
      </TabFade>
    </View>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  sub,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.profileRow, !last && styles.profileRowDivider]}>
      <View style={styles.profileRowIcon}>
        <Ionicons name={icon} size={16} color={colors.accentViolet} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.profileRowLabel}>{label}</Text>
        <Text style={styles.profileRowSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  pageTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text, marginBottom: spacing.md },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.borderStrong },
  name: { fontFamily: fonts.displaySemi, fontSize: 17, color: colors.text },
  location: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  tierName: { fontFamily: fonts.bodyBold, fontSize: 12.5 },
  profileMetaRow: { flexDirection: 'row', gap: 6, marginTop: spacing.lg, flexWrap: 'wrap' },
  metaChip: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  metaChipText: { fontFamily: fonts.bodyMed, fontSize: 10.5, color: colors.textMuted },
  langHint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  langRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  langChip: {
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  langChipActive: { backgroundColor: colors.accentViolet, borderColor: colors.accentViolet },
  langChipText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.textMuted },
  langChipTextActive: { color: '#0B0B0D' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  profileRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderDim },
  profileRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(177,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRowLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  profileRowSub: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.md,
  },
  adminLinkText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textFaint },
});
