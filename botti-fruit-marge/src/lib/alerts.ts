import type { CalcResult, Unit } from './calc';
import { formatCoefficient, formatPercent } from './format';

export type AlertTone = 'warning' | 'success' | 'neutral';

export type MarginAlert = {
  tone: AlertTone;
  title: string;
  message: string;
};

/**
 * Lecture métier du résultat. Les seuils sont ceux de la vente directe de
 * frais : en dessous de ×2 au kilo, la casse et les invendus ne sont
 * généralement pas couverts.
 */
export function buildAlert(result: CalcResult, unit: Unit): MarginAlert {
  if (!result.isComplete) {
    return {
      tone: 'neutral',
      title: 'En attente de chiffres',
      message:
        "Renseigne le prix d'achat et la méthode de calcul : les indicateurs se mettent à jour à chaque frappe.",
    };
  }

  const coefficient = formatCoefficient(result.coefficient);

  if (unit === 'kg' && result.coefficient < 2) {
    return {
      tone: 'warning',
      title: 'Coefficient faible',
      message: `Coefficient de ${coefficient} — faible pour du frais périssable en vente directe (usuellement ×2 à ×2,5 mini).`,
    };
  }

  if (result.coefficient >= 2.5 && result.coefficient <= 3.5) {
    return {
      tone: 'success',
      title: 'Fourchette premium',
      message: `Coefficient ${coefficient} — dans la fourchette premium (sec / apéritif).`,
    };
  }

  if (result.markRate < 25) {
    return {
      tone: 'warning',
      title: 'Marge serrée',
      message: `Taux de marque réel de ${formatPercent(result.markRate)} — marge serrée, vérifie que ça couvre la casse et les invendus.`,
    };
  }

  return {
    tone: 'success',
    title: 'Marge cohérente',
    message: `Coefficient ${coefficient} pour un taux de marque de ${formatPercent(result.markRate)} : la marge couvre les coûts saisis.`,
  };
}
