import { StyleSheet, Text, View } from 'react-native';

import type { CalcResult } from '../lib/calc';
import { formatCoefficient, formatEuro, formatPercent } from '../lib/format';
import { colors, fonts, onGreen, radius, space } from '../theme';

type Props = {
  name: string;
  /** « /kg » ou « /portion ». */
  unitLabel: string;
  /** Rappel de conversion sous la ligne matière, en mode portion. */
  materialNote?: string;
  result: CalcResult;
};

/**
 * Bloc résultat dessiné comme une étiquette de prix suspendue : vert profond,
 * coin supérieur gauche très arrondi, œillet perforé et ficelle.
 */
export function PriceTag({ name, unitLabel, materialNote, result }: Props) {
  const loss = result.marginHT < 0;
  const displayName = name.trim();

  return (
    <View style={styles.wrapper}>
      <View style={styles.cord} />
      <View style={styles.tag}>
        <View style={styles.head}>
          <View style={styles.punch} />
          <Text style={styles.name} numberOfLines={2}>
            {displayName || 'Prix de vente'}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text
            style={styles.price}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {formatEuro(result.priceTTC)}
          </Text>
          <Text style={styles.priceUnit}>{unitLabel}</Text>
        </View>

        <Text style={styles.subPrice}>soit {formatEuro(result.priceHT)} HT</Text>
        {result.rounded ? (
          <Text style={styles.roundedNote}>
            arrondi depuis {formatEuro(result.theoreticalTTC)}
          </Text>
        ) : null}

        <View style={styles.rule} />

        <Row label="Prix d'achat matière (HT)" note={materialNote} value={formatEuro(result.materialCost)} />
        <Row label="+ Main d'œuvre" value={formatEuro(result.labor)} />
        <Row label="+ Emballage / contenant" value={formatEuro(result.packaging)} />
        <Row label="= Prix d'achat HT total" value={formatEuro(result.totalPurchaseHT)} strong />

        <View style={styles.rule} />

        <Row
          label="Marge brute HT"
          value={formatEuro(result.marginHT)}
          strong
          highlighted={loss}
          badge={loss ? 'vente à perte' : undefined}
        />
        <Row label="Taux de marque réel" value={formatPercent(result.markRate)} />
        <Row label="Coefficient réel" value={formatCoefficient(result.coefficient)} />
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  note,
  strong,
  highlighted,
  badge,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text style={[styles.label, strong && styles.labelStrong]}>{label}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.value,
          strong && styles.valueStrong,
          highlighted && styles.valueHighlighted,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 16,
  },
  // Ficelle qui plonge vers l'œillet.
  cord: {
    position: 'absolute',
    top: 0,
    left: 34,
    width: 2,
    height: 24,
    backgroundColor: colors.line,
    transform: [{ rotate: '16deg' }],
  },
  tag: {
    backgroundColor: colors.greenDeep,
    borderRadius: radius.tag,
    // Le coin haut-gauche, plus ouvert, donne la silhouette de l'étiquette.
    borderTopLeftRadius: 36,
    padding: 20,
    paddingTop: 18,
    gap: 2,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.sm,
  },
  punch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.greenMid,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: onGreen.soft,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  price: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 62,
    color: colors.ocre,
  },
  priceUnit: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 30,
    color: onGreen.soft,
  },
  subPrice: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: onGreen.soft,
  },
  roundedNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: onGreen.faint,
  },
  rule: {
    height: 1,
    backgroundColor: onGreen.rule,
    marginVertical: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: 3,
  },
  rowLabel: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: onGreen.soft,
  },
  labelStrong: {
    fontFamily: fonts.bodySemi,
    color: onGreen.strong,
  },
  note: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: onGreen.faint,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.paper,
  },
  value: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    lineHeight: 18,
    color: onGreen.strong,
  },
  valueStrong: {
    fontFamily: fonts.monoSemi,
    fontSize: 15,
  },
  valueHighlighted: {
    color: colors.ocre,
  },
});
