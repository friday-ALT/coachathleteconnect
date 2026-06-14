/** Google Health / Material 3 tokens */

export const Colors = {
  primary:        '#1A73E8',
  primaryDark:    '#1557B0',
  primaryLight:   '#E8F0FE',
  primaryGlow:    'rgba(26, 115, 232, 0.25)',
  primaryOn:      '#FFFFFF',

  accent:         '#1A73E8',
  accentSoft:     '#4285F4',
  accentLight:    'rgba(26, 115, 232, 0.12)',
  accentGlow:     'rgba(26, 115, 232, 0.3)',

  success:        '#188038',
  successLight:   'rgba(24, 128, 56, 0.12)',
  successGlow:    'rgba(24, 128, 56, 0.2)',

  electric:       '#4285F4',
  volt:           '#1A73E8',

  ink:            '#202124',
  body:           '#5F6368',
  muted:          '#80868B',
  dim:            '#9AA0A6',

  border:         '#DADCE0',
  borderStrong:   '#BDC1C6',
  background:     '#F8F9FA',
  surface:        '#FFFFFF',
  surfaceHover:   '#F1F3F4',
  surfaceSection: '#FFFFFF',
  surfaceDeep:    '#F8F9FA',
  ringTrack:      '#E8EAED',

  headerTeal:     '#007B83',
  headerPurple:   '#7B1FA2',
  headerBlue:     '#1A73E8',

  statusGreen:    '#188038',
  statusOrange:   '#E37400',
  statusRed:      '#D93025',
  statusBlue:     '#1A73E8',
  statusPurple:   '#7B1FA2',
  statusGray:     '#80868B',

  white:  '#FFFFFF',
  black:  '#000000',
  overlay: 'rgba(32, 33, 36, 0.5)',

  text:          '#202124',
  textSecondary: '#5F6368',
  error:         '#D93025',
};

/** Flat surfaces — no gloss gradients */
export const GlossGradient = {
  card: [Colors.surface, Colors.surface, Colors.surface, Colors.surface] as const,
  cardShine: ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'] as const,
  button: [Colors.primary, Colors.primary, Colors.primaryDark] as const,
  buttonAccent: [Colors.primary, Colors.primary, Colors.primaryDark] as const,
  buttonSuccess: [Colors.success, Colors.success, '#137333'] as const,
  ambient: ['#E8F0FE', '#F8F9FA', '#F8F9FA'] as const,
};

export const NTCGradients = {
  charcoal: ['#F1F3F4', '#FFFFFF', '#F8F9FA'] as const,
  ember:    ['#E8F0FE', '#FFFFFF', '#F8F9FA'] as const,
  ocean:    ['#E3F2FD', '#FFFFFF', '#F8F9FA'] as const,
  forest:   ['#E6F4EA', '#FFFFFF', '#F8F9FA'] as const,
  slate:    ['#ECEFF1', '#FFFFFF', '#F8F9FA'] as const,
  violet:   ['#F3E8FD', '#FFFFFF', '#F8F9FA'] as const,
  sunset:   ['#FEF7E0', '#FFFFFF', '#F8F9FA'] as const,
  steel:    ['#E8EAED', '#FFFFFF', '#F8F9FA'] as const,
};

export const TabThumbTints = {
  home:     ['rgba(26,115,232,0.12)', Colors.surface] as const,
  browse:   ['rgba(26,115,232,0.1)', Colors.surface] as const,
  sessions: ['rgba(26,115,232,0.1)', Colors.surface] as const,
  schedule: ['rgba(26,115,232,0.1)', Colors.surface] as const,
  requests: ['rgba(26,115,232,0.12)', Colors.surface] as const,
  profile:  ['rgba(26,115,232,0.08)', Colors.surface] as const,
};

export const SpringConfig = {
  press: { friction: 6, tension: 280, useNativeDriver: true as const },
  release: { friction: 4, tension: 200, useNativeDriver: true as const },
  tab: { friction: 7, tension: 120, useNativeDriver: true as const },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

/** Google Health–style screen rhythm — consistent horizontal inset */
export const Layout = {
  screenPaddingX: 20,
  screenPaddingBottom: 40,
  sectionGap: 24,
  cardGap: 12,
  contentMaxWidth: 600,
};

/** Standard scroll content padding for tab screens */
export function screenScrollStyle(extra?: object) {
  return {
    paddingHorizontal: Layout.screenPaddingX,
    paddingBottom: Layout.screenPaddingBottom,
    ...extra,
  };
}

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
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  gloss: {
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
};
