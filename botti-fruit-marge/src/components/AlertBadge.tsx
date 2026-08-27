import { StyleSheet, Text, View } from 'react-native';

import type { MarginAlert } from '../lib/alerts';
import { colors, fonts, radius, space } from '../theme';

const TONES = {
  warning: {
    background: 'rgba(198, 142, 23, 0.14)',
    border: colors.ocre,
    accent: colors.ocre,
    text: colors.ocreDark,
    symbol: '!',
  },
  success: {
    background: 'rgba(58, 107, 74, 0.12)',
    border: colors.green,
    accent: colors.green,
    text: colors.green,
    symbol: '✓',
  },
  neutral: {
    background: colors.paper2,
    border: colors.line,
    accent: colors.line,
    text: colors.inkSoft,
    symbol: '·',
  },
} as const;

export function AlertBadge({ alert }: { alert: MarginAlert }) {
  const tone = TONES[alert.tone];

  return (
    <View
      style={[styles.badge, { backgroundColor: tone.background, borderColor: tone.border }]}
      accessibilityRole="alert"
    >
      <View style={[styles.accent, { backgroundColor: tone.accent }]} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: tone.text }]}>
          {tone.symbol}  {alert.title}
        </Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    borderRadius: radius.field,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: space.md,
    gap: 3,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
});
