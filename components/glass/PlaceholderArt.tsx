import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { gradientForSeed, hashSeed } from '@/lib/artSeed';

const FEED_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'sparkles',
  'water',
  'flower',
  'heart',
  'sunny',
  'leaf',
];

type Props = {
  seed: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconIndex?: number;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
};

// Brand-consistent decorative art used in place of stock photography for
// product tiles and community post photos in the demo.
export function PlaceholderArt({ seed, icon, iconIndex, style, iconSize = 34 }: Props) {
  const [from, to] = gradientForSeed(seed);
  const resolvedIcon = icon ?? FEED_ICONS[(iconIndex ?? hashSeed(seed)) % FEED_ICONS.length];

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.sheen} />
      <Ionicons name={resolvedIcon} size={iconSize} color="rgba(255,255,255,0.85)" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: '70%',
    height: '60%',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-20deg' }],
  },
});
