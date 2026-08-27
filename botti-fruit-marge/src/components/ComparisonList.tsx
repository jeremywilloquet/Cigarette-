import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatCoefficient,
  formatDateTime,
  formatEuro,
  formatGrams,
  formatPercent,
} from '../lib/format';
import type { SavedProduct } from '../lib/storage';
import { colors, fonts, radius, space } from '../theme';

type Props = {
  products: SavedProduct[];
  onDelete: (id: string) => void;
};

export function ComparisonList({ products, onDelete }: Props) {
  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Aucun produit enregistré pour l'instant. Calcule un prix, nomme-le, puis
          touche « Ajouter à la liste » pour le comparer plus tard.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {products.map((product) => (
        <View key={product.id} style={styles.item}>
          <View style={styles.itemHead}>
            <View style={styles.itemTitle}>
              <Text style={styles.name} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.meta}>
                {product.unit === 'kg'
                  ? 'au kilo'
                  : `à la portion${
                      product.portionWeightG ? ` · ${formatGrams(product.portionWeightG)}` : ''
                    }`}
                {'  ·  TVA '}
                {formatPercent(product.vatRate, product.vatRate % 1 === 0 ? 0 : 1)}
              </Text>
            </View>
            <Pressable
              onPress={() => onDelete(product.id)}
              style={({ pressed }) => [styles.delete, pressed && styles.deletePressed]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Supprimer ${product.name}`}
            >
              <Text style={styles.deleteIcon}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.stats}>
            <Stat label="PA total HT" value={formatEuro(product.totalPurchaseHT)} />
            <Stat label="PV TTC" value={formatEuro(product.priceTTC)} accent />
            <Stat label="Coefficient" value={formatCoefficient(product.coefficient)} />
            <Stat label="Taux de marque" value={formatPercent(product.markRate)} />
          </View>

          <Text style={styles.date}>{formatDateTime(product.createdAt)}</Text>
        </View>
      ))}
    </View>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space.md,
  },
  empty: {
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    padding: space.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  item: {
    backgroundColor: colors.paper,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: space.md,
  },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  itemTitle: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  delete: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  deletePressed: {
    backgroundColor: 'rgba(168, 65, 43, 0.12)',
    borderColor: colors.red,
  },
  deleteIcon: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 17,
    color: colors.red,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: space.sm,
  },
  stat: {
    // Deux colonnes : tient sans défilement horizontal, iPhone SE compris.
    width: '50%',
    paddingRight: space.sm,
    gap: 1,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  statValue: {
    fontFamily: fonts.monoSemi,
    fontSize: 15,
    color: colors.ink,
  },
  statValueAccent: {
    color: colors.greenDeep,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
});
