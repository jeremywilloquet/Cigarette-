/**
 * Cœur de calcul du prix de vente.
 *
 * Règle structurante : quand l'arrondi psychologique est actif, tous les
 * indicateurs (PV HT, marge, taux de marque, coefficient) sont recalculés à
 * partir du prix réellement affiché en boutique, pas du prix théorique.
 */

export type Unit = 'kg' | 'portion';
export type Method = 'coefficient' | 'markRate' | 'targetPrice';

export type CalcInput = {
  unit: Unit;
  /** Poids d'une portion en grammes (ignoré en mode kilo). */
  portionWeightG: number;
  /** Toujours saisi au kilo, quel que soit le mode de vente. */
  purchasePricePerKg: number;
  /** € par kg ou par portion, selon `unit`. */
  labor: number;
  /** € par kg ou par portion, selon `unit`. */
  packaging: number;
  vatRate: number;
  method: Method;
  coefficient: number;
  /** Taux de marque visé, en % du prix de vente HT. */
  targetMarkRate: number;
  targetPriceTTC: number;
  roundPsychological: boolean;
};

export type CalcResult = {
  /** Coût matière ramené à l'unité de vente (kg ou portion). */
  materialCost: number;
  labor: number;
  packaging: number;
  totalPurchaseHT: number;
  /** PV HT correspondant au prix TTC réellement retenu. */
  priceHT: number;
  /** PV TTC retenu — arrondi compris. C'est le prix affiché en boutique. */
  priceTTC: number;
  /** PV TTC avant arrondi, pour montrer d'où vient le prix rond. */
  theoreticalTTC: number;
  /** true si l'arrondi a effectivement déplacé le prix. */
  rounded: boolean;
  marginHT: number;
  /** Taux de marque réel, en % du PV HT. */
  markRate: number;
  coefficient: number;
  /** false tant qu'il manque un prix d'achat ou un prix de vente exploitable. */
  isComplete: boolean;
};

const EPSILON = 1e-9;

/**
 * Arrondit à la finale « ,90 » supérieure la plus proche.
 * 8,32 € → 8,90 € ; 8,95 € → 9,90 € ; 8,90 € reste 8,90 €.
 *
 * Le calcul passe par les centimes (entiers) pour éviter les surprises de
 * l'arithmétique flottante sur des valeurs comme 8.9.
 */
export function roundToPsychologicalPrice(priceTTC: number): number {
  if (!Number.isFinite(priceTTC) || priceTTC <= 0) return 0;
  const cents = Math.round(priceTTC * 100);
  let target = Math.floor(cents / 100) * 100 + 90;
  if (target < cents) target += 100;
  return target / 100;
}

export function computeResult(input: CalcInput): CalcResult {
  // En mode portion, le prix d'achat saisi au kilo est ramené au poids servi.
  const weightFactor =
    input.unit === 'kg' ? 1 : Math.max(input.portionWeightG, 0) / 1000;

  const materialCost = Math.max(input.purchasePricePerKg, 0) * weightFactor;
  const labor = Math.max(input.labor, 0);
  const packaging = Math.max(input.packaging, 0);
  const totalPurchaseHT = materialCost + labor + packaging;

  // Toujours >= 1 : jamais de division par zéro sur la TVA.
  const vatFactor = 1 + Math.max(input.vatRate, 0) / 100;

  let theoreticalHT = 0;
  switch (input.method) {
    case 'coefficient':
      theoreticalHT = totalPurchaseHT * Math.max(input.coefficient, 0);
      break;
    case 'markRate': {
      // Un taux de marque >= 100 % n'a pas de solution : on retombe sur 0.
      const denominator = 1 - Math.max(input.targetMarkRate, 0) / 100;
      theoreticalHT =
        denominator > EPSILON ? totalPurchaseHT / denominator : 0;
      break;
    }
    case 'targetPrice':
      // Calcul inverse : on remonte du TTC visé vers le HT.
      theoreticalHT = Math.max(input.targetPriceTTC, 0) / vatFactor;
      break;
  }
  if (!Number.isFinite(theoreticalHT) || theoreticalHT < 0) theoreticalHT = 0;

  const theoreticalTTC = theoreticalHT * vatFactor;
  const priceTTC =
    input.roundPsychological && theoreticalTTC > 0
      ? roundToPsychologicalPrice(theoreticalTTC)
      : theoreticalTTC;

  // À partir d'ici, tout découle du prix retenu.
  const priceHT = priceTTC / vatFactor;
  const marginHT = priceHT - totalPurchaseHT;
  const markRate = priceHT > EPSILON ? (marginHT / priceHT) * 100 : 0;
  const coefficient = totalPurchaseHT > EPSILON ? priceHT / totalPurchaseHT : 0;

  return {
    materialCost,
    labor,
    packaging,
    totalPurchaseHT,
    priceHT,
    priceTTC,
    theoreticalTTC,
    rounded:
      input.roundPsychological &&
      Math.round(priceTTC * 100) !== Math.round(theoreticalTTC * 100),
    marginHT,
    markRate,
    coefficient,
    isComplete: totalPurchaseHT > EPSILON && priceTTC > EPSILON,
  };
}
