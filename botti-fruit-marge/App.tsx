import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
// Import graisse par graisse : la racine de ces paquets fait un require() de
// toutes les variantes (51 fichiers, ~9 Mo), alors que huit suffisent ici.
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { AlertBadge } from './src/components/AlertBadge';
import { Card } from './src/components/Card';
import { ComparisonList } from './src/components/ComparisonList';
import { InputField } from './src/components/InputField';
import { PriceTag } from './src/components/PriceTag';
import { SegmentedControl } from './src/components/SegmentedControl';
import { buildAlert } from './src/lib/alerts';
import { computeResult, type Method, type Unit } from './src/lib/calc';
import {
  formatEuro,
  formatGrams,
  parseNumber,
  sanitizeDecimalInput,
} from './src/lib/format';
import {
  buildProduct,
  loadProducts,
  saveProducts,
  type SavedProduct,
} from './src/lib/storage';
import { colors, fonts, radius, space } from './src/theme';

const UNIT_OPTIONS = [
  { value: 'kg' as Unit, label: 'Au kilo' },
  { value: 'portion' as Unit, label: 'À la portion' },
];

const METHOD_OPTIONS = [
  { value: 'coefficient' as Method, label: 'Coefficient' },
  { value: 'markRate' as Method, label: 'Taux de marque' },
  { value: 'targetPrice' as Method, label: 'Prix visé' },
];

const VAT_SHORTCUTS = ['5,5', '20'];

/** Identité stable, pour distinguer « pas encore lu » de « lu et vide ». */
const EMPTY_PRODUCTS: SavedProduct[] = [];

function Screen() {
  const insets = useSafeAreaInsets();

  // Unité de vente
  const [unit, setUnit] = useState<Unit>('kg');
  const [portionWeight, setPortionWeight] = useState('350');

  // Prix d'achat et coûts
  const [purchasePrice, setPurchasePrice] = useState('');
  const [labor, setLabor] = useState('');
  const [packaging, setPackaging] = useState('');
  const [vat, setVat] = useState('5,5');

  // Méthode de calcul
  const [method, setMethod] = useState<Method>('coefficient');
  const [coefficient, setCoefficient] = useState('2,5');
  const [markRate, setMarkRate] = useState('60');
  const [targetPrice, setTargetPrice] = useState('');

  const [rounding, setRounding] = useState(false);

  // Liste comparative
  const [name, setName] = useState('');
  const [products, setProducts] = useState<SavedProduct[]>(EMPTY_PRODUCTS);
  // Dernier état connu du disque, comparé par identité : évite de réécrire ce
  // qu'on vient de lire, et surtout d'écraser le stockage avec la liste vide
  // initiale avant que la lecture ne soit revenue.
  const persisted = useRef<SavedProduct[]>(EMPTY_PRODUCTS);

  useEffect(() => {
    let active = true;
    loadProducts().then((saved) => {
      if (!active) return;
      persisted.current = saved;
      setProducts(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (products === persisted.current) return;
    persisted.current = products;
    saveProducts(products).catch(() => {
      Alert.alert(
        'Enregistrement impossible',
        "La liste n'a pas pu être écrite sur le téléphone. Vérifie l'espace de stockage disponible.",
      );
    });
  }, [products]);

  const portionWeightValue = parseNumber(portionWeight);
  const vatValue = parseNumber(vat);
  const purchaseValue = parseNumber(purchasePrice);

  // Recalcul à chaque frappe : il n'y a pas de bouton « Calculer ».
  const result = useMemo(
    () =>
      computeResult({
        unit,
        portionWeightG: portionWeightValue,
        purchasePricePerKg: purchaseValue,
        labor: parseNumber(labor),
        packaging: parseNumber(packaging),
        vatRate: vatValue,
        method,
        coefficient: parseNumber(coefficient),
        targetMarkRate: parseNumber(markRate),
        targetPriceTTC: parseNumber(targetPrice),
        roundPsychological: rounding,
      }),
    [
      unit,
      portionWeightValue,
      purchaseValue,
      labor,
      packaging,
      vatValue,
      method,
      coefficient,
      markRate,
      targetPrice,
      rounding,
    ],
  );

  const alert = useMemo(() => buildAlert(result, unit), [result, unit]);

  const perUnit = unit === 'kg' ? '€ / kg' : '€ / portion';
  const unitLabel = unit === 'kg' ? '/kg' : '/portion';

  const handleAdd = useCallback(() => {
    const product = buildProduct({
      name,
      unit,
      portionWeightG: portionWeightValue,
      vatRate: vatValue,
      result,
    });
    // Forme fonctionnelle : deux appuis rapprochés ne peuvent pas se perdre.
    setProducts((current) => [product, ...current]);
  }, [name, unit, portionWeightValue, vatValue, result]);

  const handleDelete = useCallback((id: string) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + 48 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // Décale le contenu quand le clavier s'ouvre : aucun champ ne reste caché.
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Text style={styles.brand}>BOTTI FRUIT</Text>
          <Text style={styles.tagline}>
            Calculateur de marge · Marché Couvert des Halles, Chambéry
          </Text>
        </View>

        <Card step="1" title="Unité de vente">
          <SegmentedControl options={UNIT_OPTIONS} value={unit} onChange={setUnit} />
          {unit === 'portion' ? (
            <InputField
              label="Poids de la portion (g)"
              value={portionWeight}
              onChangeText={(value) => setPortionWeight(sanitizeDecimalInput(value))}
              suffix="g"
              placeholder="350"
              keyboardType="number-pad"
              maxLength={6}
            />
          ) : null}
        </Card>

        <Card step="2" title="Prix d'achat et coûts">
          <InputField
            label="Prix d'achat HT net (€/kg)"
            value={purchasePrice}
            onChangeText={(value) => setPurchasePrice(sanitizeDecimalInput(value))}
            suffix="€/kg"
            hint={
              unit === 'portion'
                ? `Toujours saisi au kilo — soit ${formatEuro(result.materialCost)} pour ${formatGrams(portionWeightValue)}.`
                : undefined
            }
          />
          <InputField
            label={`Main d'œuvre (${perUnit})`}
            value={labor}
            onChangeText={(value) => setLabor(sanitizeDecimalInput(value))}
            suffix={perUnit}
          />
          <InputField
            label={`Emballage / contenant (${perUnit})`}
            value={packaging}
            onChangeText={(value) => setPackaging(sanitizeDecimalInput(value))}
            suffix={perUnit}
          />
          <InputField
            label="TVA (%)"
            value={vat}
            onChangeText={(value) => setVat(sanitizeDecimalInput(value))}
            suffix="%"
            maxLength={5}
          >
            <View style={styles.chips}>
              {VAT_SHORTCUTS.map((shortcut) => {
                const active = vat === shortcut;
                return (
                  <Pressable
                    key={shortcut}
                    onPress={() => setVat(shortcut)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {shortcut} %
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </InputField>
        </Card>

        <Card step="3" title="Méthode de calcul">
          <SegmentedControl options={METHOD_OPTIONS} value={method} onChange={setMethod} />
          {method === 'coefficient' ? (
            <InputField
              label="Coefficient multiplicateur"
              value={coefficient}
              onChangeText={(value) => setCoefficient(sanitizeDecimalInput(value))}
              suffix="×"
              placeholder="2,5"
              hint="Prix de vente HT = prix d'achat HT total × coefficient."
            />
          ) : null}
          {method === 'markRate' ? (
            <InputField
              label="Taux de marque visé (% du prix de vente HT)"
              value={markRate}
              onChangeText={(value) => setMarkRate(sanitizeDecimalInput(value))}
              suffix="%"
              placeholder="60"
              hint="Un taux de 100 % ou plus n'a pas de solution : le prix reste à 0,00 €."
            />
          ) : null}
          {method === 'targetPrice' ? (
            <InputField
              label="Prix de vente TTC visé (€)"
              value={targetPrice}
              onChangeText={(value) => setTargetPrice(sanitizeDecimalInput(value))}
              suffix="€"
              hint="Calcul inverse : le HT et la marge sont déduits du prix TTC affiché."
            />
          ) : null}
        </Card>

        <Card step="4" title="Arrondi psychologique">
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              Arrondit le prix TTC à la finale ,90 supérieure (8,32 € → 8,90 €). Marge,
              taux de marque et coefficient sont alors calculés sur le prix arrondi.
            </Text>
            <Switch
              value={rounding}
              onValueChange={setRounding}
              trackColor={{ false: colors.line, true: colors.greenMid }}
              thumbColor={rounding ? colors.ocre : colors.paper}
              ios_backgroundColor={colors.line}
              accessibilityLabel="Arrondi psychologique"
            />
          </View>
        </Card>

        <PriceTag
          name={name}
          unitLabel={unitLabel}
          materialNote={
            unit === 'portion'
              ? `${formatGrams(portionWeightValue)} à ${formatEuro(purchaseValue)}/kg`
              : undefined
          }
          result={result}
        />

        <AlertBadge alert={alert} />

        <Card title="Ajouter à la liste">
          <InputField
            label="Nom du produit"
            value={name}
            onChangeText={setName}
            placeholder="Barquette de fraises, taboulé maison…"
            keyboardType="default"
            autoCapitalize="sentences"
            maxLength={60}
          />
          <Pressable
            onPress={handleAdd}
            disabled={!result.isComplete}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              !result.isComplete && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !result.isComplete }}
          >
            <Text style={styles.buttonText}>Ajouter</Text>
          </Pressable>
          {result.isComplete ? null : (
            <Text style={styles.buttonHint}>
              Renseigne un prix d'achat et une méthode de calcul pour enregistrer le
              produit.
            </Text>
          )}
        </Card>

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Mes produits</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{products.length}</Text>
            </View>
          </View>
          <ComparisonList products={products} onDelete={handleDelete} />
        </View>

        <Text style={styles.footer}>
          Tout est enregistré sur le téléphone : les produits sont retrouvés au
          prochain lancement, sans compte ni connexion.
        </Text>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // En cas d'échec de chargement, on affiche quand même l'app : le système
  // substitue ses propres polices plutôt que de laisser un écran vide.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.greenDeep} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Screen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    gap: space.lg,
  },
  header: {
    gap: space.xs,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 0.4,
    color: colors.greenDeep,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  chips: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipActive: {
    borderColor: colors.greenDeep,
    backgroundColor: colors.greenDeep,
  },
  chipText: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  chipTextActive: {
    color: colors.paper,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  switchText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.field,
    backgroundColor: colors.ocre,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.ocreDark,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    letterSpacing: 0.3,
    color: colors.paper,
  },
  buttonHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  listSection: {
    gap: space.md,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  listTitle: {
    flex: 1,
    fontFamily: fonts.displaySemi,
    fontSize: 19,
    color: colors.ink,
  },
  countPill: {
    minWidth: 26,
    alignItems: 'center',
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.paper2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  countText: {
    fontFamily: fonts.monoSemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.inkSoft,
  },
});
