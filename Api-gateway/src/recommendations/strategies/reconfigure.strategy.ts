import { RecommendationItem } from '../builder/recommendation-result.builder';
import { RecommendationStrategy } from './recommendation.strategy';

export class ReconfigureStrategy implements RecommendationStrategy {
  readonly name        = 'Reconfigurar';
  readonly strategyKey = 'reconfigureStrategy';

  generate(itemName: string, condition: string): RecommendationItem[] {
    const old = ['antiguo', 'raro'].includes(condition);
    return [
      { title: `Reparar y actualizar los componentes de "${itemName}"`, confidence: old ? 72 : 82, effort: 'medio' },
      { title: `Adaptar "${itemName}" para un propósito diferente`,     confidence: 74,            effort: 'medio' },
      { title: `Combinar con otros objetos para crear una nueva función`, confidence: 66,          effort: 'alto'  },
    ];
  }
}
