// ══════════════════════════════════════════════════════════════
// PATRÓN STRATEGY — Interfaz común
// El servicio trabaja con esta interfaz sin conocer
// cuál implementación está usando.
// ══════════════════════════════════════════════════════════════
import { RecommendationItem } from '../builder/recommendation-result.builder';

export interface RecommendationStrategy {
  readonly name:        string;
  readonly strategyKey: string;
  generate(itemName: string, condition: string): RecommendationItem[];
}
