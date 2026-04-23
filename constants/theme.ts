// Leaf Cleaning brand colors
export const Colors = {
  // Backgrounds — deep navy matching brand
  background: '#0C1828',
  surface: '#1B2A4A',
  surfaceElevated: '#243456',

  // Brand primary — Leaf Cleaning blue
  primary: '#4BAEE6',
  primaryDark: '#3A9AD4',
  primaryLight: '#7EC4F4',

  // Mapped as 'green' for backward compat (components use Colors.green)
  green: '#4BAEE6',
  greenLight: '#7EC4F4',

  // Accent / secondary
  blue: '#4BAEE6',
  blueLight: '#7EC4F4',

  // Status
  success: '#34a864',
  danger: '#E53935',
  yellow: '#E8C435',
  yellowLight: '#F0D050',
  coral: '#C85A30',
  coralLight: '#D4694A',

  // Text
  white: '#FFFFFF',
  cream: '#EDE5CC',
  creamDark: '#D8CFB8',
  textMuted: '#8aaac8',
  textFaint: '#3d5470',

  // Borders
  border: '#243456',
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
