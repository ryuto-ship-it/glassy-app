import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';

import { colors, darkColors, fonts, spacing } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';

type Props = {
  emoji?: string;
  title: string;
  subtitle?: string;
};

export function EmptyState({ emoji = '💧', title, subtitle }: Props) {
  const dark = useIsDarkScope();
  const c = dark ? darkColors : colors;
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: 6,
  },
  emoji: { fontSize: 34, marginBottom: 4 },
  title: { fontFamily: fonts.bodySemi, fontSize: 15, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
});
