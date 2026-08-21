import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/glass/AppBackground';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <AppBackground />
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.title}>이 화면은 존재하지 않아요.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>홈으로 돌아가기</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  emoji: { fontSize: 40, marginBottom: spacing.md },
  title: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text },
  link: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.accentViolet,
  },
  linkText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#0B0B0D' },
});
