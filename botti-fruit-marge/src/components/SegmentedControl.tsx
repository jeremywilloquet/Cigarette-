import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, space } from '../theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
};

/**
 * Bascule segmentée. Les libellés peuvent passer sur deux lignes : à trois
 * options, « Taux de marque » ne tient pas sur une ligne sur un iPhone SE.
 */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            <Text
              style={[styles.label, selected && styles.labelSelected]}
              numberOfLines={2}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
  },
  segmentSelected: {
    backgroundColor: colors.greenDeep,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.inkSoft,
  },
  labelSelected: {
    fontFamily: fonts.bodySemi,
    color: colors.paper,
  },
});
