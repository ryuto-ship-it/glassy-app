// GLASSY design system.
//
// The app is light-by-default now — a premium beauty-commerce look (think
// Sephora/iHerb) — with a handful of screens deliberately kept on the
// original dark "premium glass" treatment to read as a special, elevated
// area: the Wallet tab, payment/checkout modals, the tier-buy flow, the
// admin dashboard, and the desktop side link-tree panel. Those screens
// wrap themselves in <DarkScope> (see themeScope.tsx) so shared primitives
// (GlassSurface, PillButton, Skeleton, EmptyState, AppBackground,
// PriceChart) render the dark variant automatically.
//
// `colors` below is the light (default) token set. `darkColors` is the
// original dark set, unchanged, for the screens above.

export const palette = {
  black: '#0B0B0D',
  panel: '#16161A',
  panelRaised: '#1D1D22',
  ink: '#050506',
  white: '#FFFFFF',
  fog: '#C7C7CE',
  fogDim: '#8A8A93',
  // Vivid brand violet — used for dark-scope surfaces and for every
  // gradient CTA fill (buttons, hero banners) regardless of page theme,
  // since accent fills read fine on either background.
  violet: '#B18CFF',
  violetDeep: '#8C5CE0',
  violetDim: '#5A4A82',
  // Slightly desaturated violet tuned for the light theme's text/icon
  // accents (the vivid violet above is too pale for good contrast on a
  // near-white background).
  violetOnLight: '#7C57C7',
  gold: '#E8C468',
  goldDeep: '#C79A3D',
  rose: '#E07A9E',
  teal: '#6FD7C4',
  tealOnLight: '#2E9C89',
};

export const holoGradient = ['#B18CFF', '#8C5CE0', '#E8C468', '#F5F0FF'] as const;

// Accent gradients — deliberately theme-independent; a vivid violet/gold
// CTA fill looks right whether it's sitting on the light or dark base.
export const gradients = {
  card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] as const,
  violetGold: ['#B18CFF', '#E8C468'] as const,
  violet: ['#8C5CE0', '#B18CFF'] as const,
  holo: holoGradient,
  panelHeader: ['#1D1D22', '#16161A'] as const,
};

// Full-bleed page-wash gradients — these DO differ per theme, consumed by
// AppBackground (light default) / darkGradients.background (dark scope).
export const lightBackgroundGradient = ['#FDFCFA', '#F6F2FB', '#FAFAF8'] as const;
export const darkBackgroundGradient = ['#0A0A0C', '#14111C', '#0B0B0D'] as const;

export type ColorTokens = {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textOnDark: string;
  accentViolet: string;
  accentGold: string;
  accentTeal: string;
  border: string;
  borderDim: string;
  borderStrong: string;
  glassFill: string;
  glassFillStrong: string;
  shadow: string;
  danger: string;
  success: string;
};

// Light theme — the app's default now. Ivory-white beauty-commerce look.
export const colors: ColorTokens = {
  bg: '#FAFAF8',
  bgAlt: '#F2F0EC',
  surface: '#FFFFFF',
  surfaceRaised: '#F7F5F1',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textFaint: '#9B9B9B',
  textOnDark: '#F5F5F7',
  accentViolet: palette.violetOnLight,
  accentGold: palette.gold,
  accentTeal: palette.tealOnLight,
  border: 'rgba(0,0,0,0.08)',
  borderDim: 'rgba(0,0,0,0.05)',
  borderStrong: 'rgba(0,0,0,0.14)',
  glassFill: 'rgba(0,0,0,0.03)',
  glassFillStrong: 'rgba(0,0,0,0.055)',
  shadow: 'rgba(20,18,24,0.16)',
  danger: '#D63860',
  success: '#1FA971',
};

// Dark theme — the original "premium dark glass" palette, preserved
// exactly for the screens in <DarkScope>.
export const darkColors: ColorTokens = {
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 3,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 6,
  },
};

export const darkShadow = {
  soft: {
    shadowColor: darkColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 6,
  },
  lift: {
    shadowColor: darkColors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 12,
  },
};

export const TOKEN_TICKER = '$GLAS';
export const APP_NAME = 'GLASSY';
export const TAGLINE = 'Get That Glass Skin.';
