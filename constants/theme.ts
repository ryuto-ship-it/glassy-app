// GLASSY design system — glassmorphism tokens for a K-beauty membership dApp demo.

export const palette = {
  pink: '#FFD1DC',
  pinkSoft: '#FFE3EA',
  lavender: '#D8C7F5',
  lavenderSoft: '#E9E0FB',
  mint: '#C6F2E4',
  pearl: '#FAF7FB',
  pearlDim: '#F1EAF4',
  plum: '#4A2E4E',
  plumSoft: '#7A5C7E',
  white: '#FFFFFF',
  black: '#1B1120',
};

// Holographic multi-gradient reserved for the top Glass Skin tier.
export const holoGradient = ['#FFD1DC', '#E4C9F2', '#C6F2E4', '#D8C7F5'] as const;

export const gradients = {
  background: ['#FBF6FB', '#F3E9F7', '#EFE6FB'] as const,
  card: ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.25)'] as const,
  pinkLavender: ['#FFD1DC', '#D8C7F5'] as const,
  holo: holoGradient,
  plumHeader: ['#4A2E4E', '#6B4670'] as const,
};

export const colors = {
  bg: palette.pearl,
  bgAlt: palette.pearlDim,
  text: palette.plum,
  textMuted: palette.plumSoft,
  textOnDark: palette.pearl,
  accentPink: palette.pink,
  accentLavender: palette.lavender,
  accentMint: palette.mint,
  border: 'rgba(255,255,255,0.6)',
  borderDim: 'rgba(74,46,78,0.08)',
  glassFill: 'rgba(255,255,255,0.38)',
  glassFillStrong: 'rgba(255,255,255,0.55)',
  shadow: 'rgba(122,92,126,0.25)',
  danger: '#E0637C',
  success: '#5FAE8E',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const fonts = {
  display: 'Poppins_700Bold',
  displaySemi: 'Poppins_600SemiBold',
  displayMed: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const shadow = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
};

export const TOKEN_TICKER = '$GLAS';
export const APP_NAME = 'GLASSY';
export const TAGLINE = 'Get That Glass Skin.';
