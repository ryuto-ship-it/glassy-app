import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, darkColors, fonts, radius, spacing } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'ghost';
  colors_?: readonly string[];
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function PillButton({ label, onPress, variant = 'solid', colors_, disabled, icon, style }: Props) {
  const dark = useIsDarkScope();
  const c = dark ? darkColors : colors;

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.ghost, { borderColor: c.borderStrong, backgroundColor: c.glassFill }, disabled && styles.disabled, style]}
      >
        {icon}
        <Text style={[styles.ghostText, { color: c.text }]}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.solidWrap, disabled && styles.disabled, style]}>
      <LinearGradient
        colors={(colors_ ?? [darkColors.accentViolet, '#8C5CE0']) as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.solidInner}>
        {icon}
        <Text style={styles.solidText}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  solidWrap: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  solidInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  solidText: {
    fontFamily: fonts.bodyBold,
    color: '#0B0B0D',
    fontSize: 14,
  },
  ghost: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ghostText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.45,
  },
});
