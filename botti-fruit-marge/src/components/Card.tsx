import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, space } from '../theme';

type Props = {
  /** Numéro d'étape affiché dans la pastille verte. */
  step?: string;
  title: string;
  children: ReactNode;
};

export function Card({ step, title, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {step ? (
          <View style={styles.step}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper2,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  step: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: fonts.monoSemi,
    fontSize: 12,
    lineHeight: 15,
    color: colors.paper,
  },
  title: {
    flex: 1,
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.ink,
  },
});
