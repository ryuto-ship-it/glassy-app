import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';

import { ProductShape } from '@/data/mock';
import { hashSeed } from '@/lib/artSeed';

// Premium jewel-tone pairs used to render each product's packaging —
// distinct from the app accent so the shop floor still reads as varied
// merchandising, while staying in the same premium-dark family.
const PRODUCT_TONES: readonly [string, string][] = [
  ['#8C5CE0', '#B18CFF'], // violet
  ['#C79A3D', '#E8C468'], // gold
  ['#2FA98C', '#6FD7C4'], // teal
  ['#B23A63', '#E07A9E'], // rose
  ['#3B6FD9', '#7FA6FF'], // steel blue
  ['#5A4A82', '#8C7BC2'], // deep violet-gray
];

const METAL = '#2A2A30';
const METAL_LIGHT = '#45454E';

type Props = {
  seed: string;
  shape: ProductShape;
  style?: StyleProp<ViewStyle>;
};

export function ProductArt({ seed, shape, style }: Props) {
  const [from, to] = PRODUCT_TONES[hashSeed(seed) % PRODUCT_TONES.length];
  const gradId = `pa-${seed}`;

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={[`${from}26`, '#00000000']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox="0 0 160 200" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgGradient>
        </Defs>
        {renderShape(shape, gradId)}
      </Svg>
    </View>
  );
}

function renderShape(shape: ProductShape, gradId: string) {
  const fill = `url(#${gradId})`;
  switch (shape) {
    case 'dropper-bottle':
      return (
        <>
          <Ellipse cx="80" cy="20" rx="22" ry="15" fill={METAL} />
          <Rect x="72" y="10" width="16" height="8" rx="3" fill={METAL_LIGHT} />
          <Rect x="63" y="32" width="34" height="24" rx="5" fill={METAL} />
          <Path d="M46 70 Q40 60 48 56 L112 56 Q120 60 114 70 L114 168 Q114 178 104 178 L56 178 Q46 178 46 168 Z" fill={fill} />
          <Rect x="52" y="112" width="56" height="36" rx="7" fill="rgba(0,0,0,0.28)" />
          <Rect x="60" y="122" width="34" height="3" rx="1.5" fill="rgba(255,255,255,0.65)" />
          <Rect x="60" y="130" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <Path d="M54 66 L60 66 L52 172 L48 172 Z" fill="rgba(255,255,255,0.16)" />
        </>
      );
    case 'pill-bottle':
      return (
        <>
          <Rect x="40" y="26" width="80" height="28" rx="9" fill={METAL} />
          <Rect x="48" y="30" width="64" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
          <Rect x="48" y="38" width="64" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
          <Path d="M42 62 Q42 54 50 54 L110 54 Q118 54 118 62 L118 168 Q118 180 106 180 L54 180 Q42 180 42 168 Z" fill={fill} />
          <Rect x="46" y="98" width="68" height="42" rx="7" fill="rgba(0,0,0,0.28)" />
          <Rect x="54" y="110" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.65)" />
          <Rect x="54" y="118" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <Path d="M48 60 L56 60 L48 176 L44 176 Z" fill="rgba(255,255,255,0.14)" />
        </>
      );
    case 'tube':
      return (
        <>
          <Rect x="60" y="26" width="40" height="22" rx="6" fill={METAL} />
          <Rect x="68" y="18" width="24" height="12" rx="4" fill={METAL_LIGHT} />
          <Path
            d="M62 48 L98 48 L112 84 Q118 96 118 112 L118 168 Q118 182 104 182 L56 182 Q42 182 42 168 L42 112 Q42 96 48 84 Z"
            fill={fill}
          />
          <Rect x="50" y="120" width="60" height="38" rx="7" fill="rgba(0,0,0,0.26)" />
          <Rect x="58" y="132" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.65)" />
          <Rect x="58" y="140" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <Path d="M58 52 L64 52 L48 178 L44 176 Z" fill="rgba(255,255,255,0.14)" />
        </>
      );
    case 'pouch':
      return (
        <>
          <Path d="M30 64 Q30 50 44 50 L116 50 Q130 50 130 64 L130 166 Q130 182 114 182 L46 182 Q30 182 30 166 Z" fill={fill} />
          <Path d="M30 64 Q30 50 44 50 L116 50 Q130 50 130 64 L130 74 L30 74 Z" fill="rgba(0,0,0,0.3)" />
          <Path d="M74 50 L86 50 L80 40 Z" fill="rgba(0,0,0,0.3)" />
          <Ellipse cx="108" cy="62" rx="5" ry="5" fill="#0B0B0D" opacity={0.5} />
          <Ellipse cx="80" cy="110" rx="34" ry="30" fill="rgba(255,255,255,0.14)" />
          <Rect x="52" y="150" width="56" height="3" rx="1.5" fill="rgba(255,255,255,0.55)" />
          <Rect x="60" y="158" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
        </>
      );
    case 'jar':
      return (
        <>
          <Ellipse cx="80" cy="52" rx="48" ry="14" fill={METAL} />
          <Rect x="34" y="44" width="92" height="20" rx="10" fill={METAL_LIGHT} />
          <Path d="M36 66 Q36 58 44 58 L116 58 Q124 58 124 66 L124 158 Q124 176 106 176 L54 176 Q36 176 36 158 Z" fill={fill} />
          <Ellipse cx="80" cy="118" rx="30" ry="26" fill="rgba(0,0,0,0.22)" />
          <Rect x="60" y="112" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
          <Rect x="66" y="120" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.38)" />
          <Path d="M42 70 L50 70 L40 168 L34 166 Z" fill="rgba(255,255,255,0.14)" />
        </>
      );
    case 'box':
    default:
      return (
        <>
          <Rect x="30" y="58" width="100" height="112" rx="10" fill={fill} />
          <Rect x="30" y="58" width="100" height="26" rx="10" fill="rgba(0,0,0,0.24)" />
          <Rect x="72" y="58" width="16" height="112" fill="#E8C468" opacity={0.9} />
          <Rect x="30" y="96" width="100" height="16" fill="#E8C468" opacity={0.9} />
          <Path d="M72 58 Q80 42 88 58 Z" fill="#E8C468" />
          <Path d="M66 58 L80 68 L94 58 Z" fill="#F5DFA0" opacity={0.9} />
        </>
      );
  }
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
