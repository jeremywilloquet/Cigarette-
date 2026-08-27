import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { colors, fonts, radius, space } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Unité affichée à droite du champ : « €/kg », « % », « g »… */
  suffix?: string;
  placeholder?: string;
  /** Précision affichée sous le champ (conversion, rappel de calcul). */
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Contenu additionnel sous le champ (boutons de TVA rapide, par exemple). */
  children?: ReactNode;
};

export function InputField({
  label,
  value,
  onChangeText,
  suffix,
  placeholder = '0',
  hint,
  keyboardType = 'decimal-pad',
  maxLength = 12,
  autoCapitalize = 'none',
  children,
}: Props) {
  const [focused, setFocused] = useState(false);
  const numeric = keyboardType === 'decimal-pad' || keyboardType === 'number-pad';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          style={[styles.input, numeric ? styles.inputNumeric : styles.inputText]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.line}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor={colors.ocre}
          accessibilityLabel={label}
          // Le clavier décimal iOS n'a pas de touche « Entrée » : le champ se
          // ferme en touchant ailleurs ou en faisant glisser la liste.
          returnKeyType="done"
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    letterSpacing: 0.2,
    color: colors.inkSoft,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: space.md,
  },
  fieldFocused: {
    borderColor: colors.ocre,
  },
  input: {
    flex: 1,
    paddingVertical: space.sm,
    color: colors.ink,
  },
  inputNumeric: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
  },
  inputText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  suffix: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.inkSoft,
    marginLeft: space.sm,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkSoft,
  },
});
