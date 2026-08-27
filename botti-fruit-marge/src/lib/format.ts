/**
 * Formatage et saisie des nombres en français : virgule décimale, espace
 * insécable comme séparateur de milliers et devant l'unité.
 *
 * Tout est fait à la main plutôt qu'avec Intl : le rendu est ainsi identique
 * quelle que soit la langue du téléphone, et ne dépend pas des données de
 * locale embarquées dans le moteur JS.
 */

const NBSP = '\u00A0'; // espace insécable

/** Convertit une saisie utilisateur (« 2,5 », « 2.5 », « 12 ») en nombre. Jamais NaN. */
export function parseNumber(raw: string): number {
  if (!raw) return 0;
  const normalized = raw.replace(/\s/g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Nettoie la frappe au clavier numérique : chiffres et un seul séparateur
 * décimal, normalisé en virgule (le clavier iOS français envoie « , », le
 * clavier anglais « . » — les deux doivent marcher).
 */
export function sanitizeDecimalInput(raw: string): string {
  let out = '';
  let hasSeparator = false;
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      out += char;
    } else if ((char === ',' || char === '.') && !hasSeparator) {
      out += ',';
      hasSeparator = true;
    }
  }
  return out;
}

function groupThousands(integerPart: string): string {
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** 1234.5 → « 1 234,50 ». Les valeurs vides ou non finies retombent sur 0. */
export function formatDecimal(value: number, decimals = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  // On arrondit avant de tester le signe pour ne pas afficher « -0,00 ».
  const rounded = Number(safe.toFixed(decimals));
  const sign = rounded < 0 ? '-' : '';
  const [integerPart, decimalPart] = Math.abs(rounded).toFixed(decimals).split('.');
  return sign + groupThousands(integerPart) + (decimalPart ? ',' + decimalPart : '');
}

/** 8.9 → « 8,90 € ». */
export function formatEuro(value: number, decimals = 2): string {
  return formatDecimal(value, decimals) + NBSP + '€';
}

/** 58.33 → « 58,3 % ». */
export function formatPercent(value: number, decimals = 1): string {
  return formatDecimal(value, decimals) + NBSP + '%';
}

/** 2.534 → « ×2,53 ». */
export function formatCoefficient(value: number): string {
  return '×' + formatDecimal(value, 2);
}

/** Poids en grammes, sans décimale inutile : 350 → « 350 g ». */
export function formatGrams(value: number): string {
  return formatDecimal(value, 0) + NBSP + 'g';
}

/** Date d'enregistrement, format court : « 27/08/2026 à 14:05 ». */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` +
    ` à ${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
