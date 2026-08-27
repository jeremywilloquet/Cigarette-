/**
 * Palette « étiquette de prix de marché » — BOTTI FRUIT.
 * Ces valeurs sont la référence : ne pas introduire de couleur hors de cette liste.
 */
export const colors = {
  greenDeep: '#1E3A2E',
  greenMid: '#345C46',
  ocre: '#C68E17',
  ocreDark: '#9C6E10',
  paper: '#F3EFE2',
  paper2: '#EAE3D0',
  ink: '#241F18',
  inkSoft: '#5B5347',
  line: '#D8CFB8',
  red: '#A8412B',
  green: '#3A6B4A',
} as const;

/** Déclinaisons translucides du papier, pour le texte posé sur le vert profond. */
export const onGreen = {
  strong: colors.paper,
  soft: 'rgba(243, 239, 226, 0.68)',
  faint: 'rgba(243, 239, 226, 0.45)',
  rule: 'rgba(243, 239, 226, 0.18)',
} as const;

/** Familles chargées par useFonts() dans App.tsx — les clés doivent rester identiques. */
export const fonts = {
  displaySemi: 'Fraunces_600SemiBold',
  display: 'Fraunces_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemi: 'IBMPlexMono_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

export const radius = {
  field: 10,
  card: 16,
  tag: 20,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;
