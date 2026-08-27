import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CalcResult, Unit } from './calc';

const STORAGE_KEY = 'botti-fruit.produits.v1';

export type SavedProduct = {
  id: string;
  name: string;
  unit: Unit;
  /** null en mode kilo. */
  portionWeightG: number | null;
  materialCost: number;
  labor: number;
  packaging: number;
  totalPurchaseHT: number;
  priceHT: number;
  priceTTC: number;
  vatRate: number;
  coefficient: number;
  markRate: number;
  /** ISO 8601. */
  createdAt: string;
};

function toFiniteNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Remet une entrée lue du disque dans une forme exploitable. Une entrée
 * partielle ou abîmée est réparée avec des zéros plutôt que d'être jetée :
 * mieux vaut une ligne incomplète qu'une liste qui disparaît.
 */
function normalize(raw: unknown, index: number): SavedProduct | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const entry = raw as Record<string, unknown>;
  const unit: Unit = entry.unit === 'portion' ? 'portion' : 'kg';
  const portionWeightG =
    entry.portionWeightG === null || entry.portionWeightG === undefined
      ? null
      : toFiniteNumber(entry.portionWeightG);

  return {
    id: typeof entry.id === 'string' && entry.id ? entry.id : `legacy-${index}`,
    name: typeof entry.name === 'string' ? entry.name : '',
    unit,
    portionWeightG: unit === 'portion' ? portionWeightG : null,
    materialCost: toFiniteNumber(entry.materialCost),
    labor: toFiniteNumber(entry.labor),
    packaging: toFiniteNumber(entry.packaging),
    totalPurchaseHT: toFiniteNumber(entry.totalPurchaseHT),
    priceHT: toFiniteNumber(entry.priceHT),
    priceTTC: toFiniteNumber(entry.priceTTC),
    vatRate: toFiniteNumber(entry.vatRate),
    coefficient: toFiniteNumber(entry.coefficient),
    markRate: toFiniteNumber(entry.markRate),
    createdAt:
      typeof entry.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
  };
}

/** Liste enregistrée, les plus récents d'abord. Ne rejette jamais. */
export async function loadProducts(): Promise<SavedProduct[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalize)
      .filter((entry): entry is SavedProduct => entry !== null);
  } catch {
    // Stockage illisible (JSON corrompu, quota) : on repart d'une liste vide
    // plutôt que de bloquer l'app au démarrage.
    return [];
  }
}

/** Écrit la liste. Lève en cas d'échec pour que l'appelant puisse prévenir. */
export async function saveProducts(products: SavedProduct[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function buildProduct(params: {
  name: string;
  unit: Unit;
  portionWeightG: number;
  vatRate: number;
  result: CalcResult;
}): SavedProduct {
  const { name, unit, portionWeightG, vatRate, result } = params;
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    name: name.trim() || 'Sans nom',
    unit,
    portionWeightG: unit === 'portion' ? portionWeightG : null,
    materialCost: result.materialCost,
    labor: result.labor,
    packaging: result.packaging,
    totalPurchaseHT: result.totalPurchaseHT,
    priceHT: result.priceHT,
    priceTTC: result.priceTTC,
    vatRate,
    coefficient: result.coefficient,
    markRate: result.markRate,
    createdAt: new Date().toISOString(),
  };
}
