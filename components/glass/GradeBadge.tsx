import Svg, { Circle, Defs, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';

import { TierId } from '@/constants/glow';

type Props = {
  tier: TierId;
  size?: number;
};

// Custom per-tier SVG badge. Each tier gets a distinct silhouette so the
// grade is recognizable even without reading the label.
export function GradeBadge({ tier, size = 64 }: Props) {
  const id = `g-${tier}-${size}`;
  switch (tier) {
    case 'bare-skin':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#D9D4DE" />
              <Stop offset="1" stopColor="#A79FB2" />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="42" fill={`url(#${id})`} />
          <Circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
          <Circle cx="38" cy="36" r="9" fill="rgba(255,255,255,0.25)" />
        </Svg>
      );
    case 'dewy-glow':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFE3EA" />
              <Stop offset="1" stopColor="#FFB9C9" />
            </LinearGradient>
            <RadialGradient id={`${id}-dot`} cx="0.35" cy="0.3" r="0.6">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="42" fill={`url(#${id})`} />
          <Circle cx="50" cy="50" r="42" fill={`url(#${id}-dot)`} />
          {/* droplet highlight */}
          <Path
            d="M50 30C50 30 40 44 40 52C40 58.6 44.5 63 50 63C55.5 63 60 58.6 60 52C60 44 50 30 50 30Z"
            fill="rgba(255,255,255,0.75)"
          />
        </Svg>
      );
    case 'radiant-glass':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#EFE6FB" />
              <Stop offset="0.5" stopColor="#D8C7F5" />
              <Stop offset="1" stopColor="#C6AFF0" />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="42" fill={`url(#${id})`} />
          {/* facet lines for a hologram feel */}
          <Polygon points="50,12 50,88" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          <Polygon points="14,50 86,50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <Polygon points="50,12 78,50 50,88 22,50" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <Circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none" />
        </Svg>
      );
    case 'glass-skin':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFD1DC" />
              <Stop offset="0.5" stopColor="#D8C7F5" />
              <Stop offset="1" stopColor="#C6F2E4" />
            </LinearGradient>
            <LinearGradient id={`${id}-prism`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.15} />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="42" fill={`url(#${id})`} opacity={0.9} />
          {/* translucent prism */}
          <Polygon points="50,14 82,66 18,66" fill={`url(#${id}-prism)`} opacity={0.8} />
          <Polygon points="50,14 82,66 18,66" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity={0.9} />
          {/* sparkle accents */}
          <Path d="M76 26 L79 33 L86 36 L79 39 L76 46 L73 39 L66 36 L73 33 Z" fill="#FFFFFF" opacity={0.9} />
          <Path d="M26 70 L28 75 L33 77 L28 79 L26 84 L24 79 L19 77 L24 75 Z" fill="#FFFFFF" opacity={0.8} />
        </Svg>
      );
  }
}
