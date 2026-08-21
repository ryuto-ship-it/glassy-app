import Svg, { Circle, Defs, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';

import { TierId } from '@/constants/glow';

type Props = {
  tier: TierId;
  size?: number;
};

// Custom per-tier SVG badge — reads like a minted medallion on dark glass
// rather than a pastel sticker. Each tier keeps a distinct silhouette so
// the grade is recognizable even without reading the label.
export function GradeBadge({ tier, size = 64 }: Props) {
  const id = `g-${tier}-${size}`;
  switch (tier) {
    case 'bare-skin':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#7C8290" />
              <Stop offset="1" stopColor="#4B4F58" />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="44" fill="#1B1B1F" />
          <Circle cx="50" cy="50" r="40" fill={`url(#${id})`} />
          <Circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />
          <Circle cx="38" cy="36" r="8" fill="rgba(255,255,255,0.12)" />
        </Svg>
      );
    case 'dewy-glow':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#E07A9E" />
              <Stop offset="1" stopColor="#B23A63" />
            </LinearGradient>
            <RadialGradient id={`${id}-dot`} cx="0.35" cy="0.3" r="0.6">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="44" fill="#1B1B1F" />
          <Circle cx="50" cy="50" r="40" fill={`url(#${id})`} />
          <Circle cx="50" cy="50" r="40" fill={`url(#${id}-dot)`} />
          <Path
            d="M50 30C50 30 40 44 40 52C40 58.6 44.5 63 50 63C55.5 63 60 58.6 60 52C60 44 50 30 50 30Z"
            fill="rgba(255,255,255,0.55)"
          />
        </Svg>
      );
    case 'radiant-glass':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#B18CFF" />
              <Stop offset="1" stopColor="#6B3FBF" />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="44" fill="#1B1B1F" />
          <Circle cx="50" cy="50" r="40" fill={`url(#${id})`} />
          {/* facet lines for a hologram feel */}
          <Polygon points="50,14 50,86" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          <Polygon points="16,50 84,50" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
          <Polygon points="50,14 78,50 50,86 22,50" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <Circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        </Svg>
      );
    case 'glass-skin':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#B18CFF" />
              <Stop offset="0.55" stopColor="#8C5CE0" />
              <Stop offset="1" stopColor="#E8C468" />
            </LinearGradient>
            <LinearGradient id={`${id}-prism`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.8} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.1} />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="44" fill="#1B1B1F" />
          <Circle cx="50" cy="50" r="40" fill={`url(#${id})`} />
          {/* translucent prism */}
          <Polygon points="50,16 80,64 20,64" fill={`url(#${id}-prism)`} opacity={0.85} />
          <Polygon points="50,16 80,64 20,64" stroke="#FFFFFF" strokeWidth="1.3" fill="none" opacity={0.8} />
          {/* sparkle accents */}
          <Path d="M74 28 L77 34 L83 37 L77 40 L74 46 L71 40 L65 37 L71 34 Z" fill="#F5F0FF" opacity={0.9} />
          <Path d="M27 68 L29 72 L33 74 L29 76 L27 80 L25 76 L21 74 L25 72 Z" fill="#E8C468" opacity={0.85} />
        </Svg>
      );
  }
}
