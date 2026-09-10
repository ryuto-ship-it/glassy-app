import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { fonts } from '@/constants/theme';
import { hashSeed } from '@/lib/artSeed';

// A small family of CHARM-blue shades (plus one gold accent for variety)
// so avatars sitting next to each other in a row/feed stay visually
// distinct instead of all reading as one flat color block.
const AVATAR_COLORS = ['#1B5FA8', '#4FB6E8', '#15568F', '#2C4A68', '#3A86C8', '#0E3A5F', '#C79A3D'];

function colorForName(name: string): string {
  return AVATAR_COLORS[hashSeed(name || '?') % AVATAR_COLORS.length];
}

// "Bella Yujin" -> "BY", "Sofia" -> "S", "하은"/"어머니" -> first syllable
// (Korean names don't split into initials the Latin way).
function initialsFor(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  if (/[가-힣]/.test(trimmed)) return trimmed[0];
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

type Props = {
  name: string;
  size?: number;
  style?: ViewStyle;
};

// Real-photo-free stand-in for every person avatar in the app (user
// profile, chat header, family members, community authors, pharmacist,
// trust-quote reviewers) — a simple initials-on-brand-blue circle instead
// of a stock headshot, per-name colored so a row of avatars stays legible.
export function InitialAvatar({ name, size = 40, style }: Props) {
  const bg = colorForName(name);
  const initials = initialsFor(name);
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]} numberOfLines={1}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { fontFamily: fonts.bodyBold, color: '#FFFFFF' },
});
