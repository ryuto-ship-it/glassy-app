// GLASSY design system — premium dark fintech/commerce tokens.
// Pastel glassmorphism has been fully retired in favor of a dark, high-
// contrast "premium dark glass" surface treatment.

export const palette = {
  black: '#0B0B0D',
  panel: '#16161A',
  panelRaised: '#1D1D22',
  ink: '#050506',
  white: '#FFFFFF',
  fog: '#C7C7CE',
  fogDim: '#8A8A93',
  violet: '#B18CFF',
  violetDeep: '#8C5CE0',
  violetDim: '#5A4A82',
  gold: '#E8C468',
  goldDeep: '#C79A3D',
  rose: '#E07A9E',
  teal: '#6FD7C4',
};

// Holographic multi-gradient reserved for the top Glass Skin tier —
// violet fusing into gold with a near-white specular sheen.
export const holoGradient = ['#B18CFF', '#8C5CE0', '#E8C468', '#F5F0FF'] as const;

export const gradients = {
  background: ['#0A0A0C', '#14111C', '#0B0B0D'] as const,
  card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] as const,
  violetGold: ['#B18CFF', '#E8C468'] as const,
  violet: ['#8C5CE0', '#B18CFF'] as const,
  holo: holoGradient,
  panelHeader: ['#1D1D22', '#16161A'] as const,
};

export const colors = {
  bg: palette.black,
  bgAlt: palette.panel,
  surface: palette.panel,
  surfaceRaised: palette.panelRaised,
  text: '#F5F5F7',
  textMuted: palette.fog,
  textFaint: palette.fogDim,
  textOnDark: '#F5F5F7',
  accentViolet: palette.violet,
  accentGold: palette.gold,
  accentTeal: palette.teal,
  border: 'rgba(255,255,255,0.08)',
  borderDim: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.14)',
  glassFill: 'rgba(255,255,255,0.045)',
  glassFillStrong: 'rgba(255,255,255,0.075)',
  shadow: 'rgba(0,0,0,0.55)',
  danger: '#F0637E',
  success: '#4ADE9A',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
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
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 6,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 12,
  },
};

export const TOKEN_TICKER = '$GLAS';
export const APP_NAME = 'GLASSY';
export const TAGLINE = 'Get That Glass Skin.';
