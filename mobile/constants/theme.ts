export const Colors = {
  // Brand
  primary:        '#00C875',
  primaryDark:    '#00A65E',
  primaryLight:   '#E6FAF2',

  // Accent
  accent:         '#FF6B35',
  accentLight:    '#FFF0EA',

  // Text
  ink:            '#1A1A2E',
  body:           '#4A4A6A',
  muted:          '#8F8FA8',

  // Borders & surfaces
  border:         '#E4E4F0',
  borderStrong:   '#C8C8DC',
  background:     '#F7F7FC',
  surface:        '#FFFFFF',
  surfaceHover:   '#F0F0F8',
  surfaceSection: '#EDEDF5',

  // Status pills (Monday-style)
  statusGreen:    '#00C875',
  statusOrange:   '#FDAB3D',
  statusRed:      '#E2445C',
  statusBlue:     '#0086C0',
  statusPurple:   '#A25DDC',
  statusGray:     '#C4C4CF',

  // Utility
  white:  '#FFFFFF',
  black:  '#000000',
  overlay: 'rgba(26,26,46,0.55)',

  // Legacy aliases — kept for any remaining references
  text:          '#1A1A2E',
  textSecondary: '#8F8FA8',
  error:         '#E2445C',
  success:       '#00C875',
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const BorderRadius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 9999,
};

export const FontSizes = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    17,
  lg:    20,
  xl:    24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
};

export const Shadow = {
  xs: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
