/** Helix tokens — aligned with client/src/helix.css */

export const Colors = {
  // Primary green CTAs (--helix-green)
  primary:        '#22c55e',
  primaryDark:    '#16a34a',
  primaryLight:   'rgba(34, 197, 94, 0.12)',
  primaryGlow:    'rgba(34, 197, 94, 0.35)',
  primaryOn:      '#0a0a0a',

  // Accent — links, active states, highlights (same green family)
  accent:         '#22c55e',
  accentSoft:     '#3ef07a',
  accentLight:    'rgba(34, 197, 94, 0.16)',
  accentGlow:     'rgba(34, 197, 94, 0.4)',

  success:        '#22c55e',
  successLight:   'rgba(34, 197, 94, 0.15)',
  successGlow:    'rgba(34, 197, 94, 0.35)',

  electric:       '#3ef07a',
  volt:           '#22c55e',

  // Text — Helix hierarchy
  ink:            '#f4f4f5',
  body:           '#a1a1aa',
  muted:          '#71717a',
  dim:            '#52525b',

  // Surfaces — neutral black/gray
  border:         'rgba(255, 255, 255, 0.08)',
  borderStrong:   'rgba(255, 255, 255, 0.14)',
  background:     '#0a0a0a',
  surface:        '#171717',
  surfaceHover:   '#1f1f1f',
  surfaceSection: '#111111',
  surfaceDeep:    '#0a0a0a',
  ringTrack:      '#2e2e2e',

  // Status
  statusGreen:    '#22c55e',
  statusOrange:   '#eab308',
  statusRed:      '#ef4444',
  statusBlue:     '#3b82f6',
  statusPurple:   '#a78bfa',
  statusGray:     '#71717a',

  white:  '#FFFFFF',
  black:  '#000000',
  overlay: 'rgba(10, 10, 10, 0.72)',

  text:          '#f4f4f5',
  textSecondary: '#71717a',
  error:         '#ef4444',
};

/** Gloss card + button gradients (mirrors .gloss-card / .gloss-btn) */
export const GlossGradient = {
  card: [
    'rgba(255,255,255,0.06)',
    'rgba(255,255,255,0.02)',
    Colors.surface,
    '#121212',
  ] as const,
  cardShine: [
    'transparent',
    'rgba(255,255,255,0.05)',
    'rgba(255,255,255,0.12)',
    'rgba(255,255,255,0.03)',
    'transparent',
  ] as const,
  button: ['#3ef07a', '#22c55e', '#16a34a'] as const,
  buttonAccent: ['#3ef07a', '#22c55e', '#16a34a'] as const,
  buttonSuccess: ['#3ef07a', '#22c55e', '#16a34a'] as const,
  ambient: ['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.04)', 'transparent'] as const,
};

/** Feature-card palettes — Helix-tinted gloss tones */
export const NTCGradients = {
  charcoal: ['#2a2a2a', '#171717', '#111111'] as const,
  ember:    ['#1a3d28', '#122818', '#0a140c'] as const,
  ocean:    ['#1a2e3d', '#121f28', '#0a1018'] as const,
  forest:   ['#143d28', '#0c2818', '#06140c'] as const,
  slate:    ['#2a3038', '#1a1f28', '#0c1018'] as const,
  violet:   ['#2a1a3d', '#1a1028', '#0c0814'] as const,
  sunset:   ['#3d2a1a', '#281810', '#140c08'] as const,
  steel:    ['#2a3238', '#1a2228', '#0c1014'] as const,
};

export const TabThumbTints = {
  home:     ['rgba(34,197,94,0.35)', 'rgba(10,10,10,0.7)'] as const,
  browse:   ['rgba(34,197,94,0.3)', 'rgba(10,10,10,0.7)'] as const,
  sessions: ['rgba(34,197,94,0.28)', 'rgba(10,10,10,0.7)'] as const,
  schedule: ['rgba(34,197,94,0.28)', 'rgba(10,10,10,0.7)'] as const,
  requests: ['rgba(34,197,94,0.35)', 'rgba(10,10,10,0.7)'] as const,
  profile:  ['rgba(34,197,94,0.25)', 'rgba(10,10,10,0.7)'] as const,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  md: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gloss: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
};
