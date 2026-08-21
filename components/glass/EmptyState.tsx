import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/constants/theme';

type Props = {
  emoji?: string;
  title: string;
  subtitle?: string;
};

export function EmptyState({ emoji = '💧', title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  title: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
