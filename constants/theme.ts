export const Colors = {
  background: '#1A1A1A',
  surface: '#262626',
  surfaceElevated: '#2E2E2E',
  coral: '#C85A30',
  coralLight: '#D4694A',
  yellow: '#E8C435',
  yellowLight: '#F0D050',
  green: '#6BAF6B',
  greenLight: '#7DC87D',
  blue: '#7BA4C8',
  blueLight: '#8DB5D8',
  cream: '#EDE5CC',
  creamDark: '#D8CFB8',
  white: '#FFFFFF',
  textMuted: '#888888',
  textFaint: '#555555',
  border: '#2E2E2E',
  success: '#4CAF50',
  danger: '#E53935',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Typography = {
  hero: { fontSize: 40, fontWeight: '900' as const, letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};
