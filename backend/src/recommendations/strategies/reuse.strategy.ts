import { RecommendationItem } from '../builder/recommendation-result.builder';
import { RecommendationStrategy } from './recommendation.strategy';

export class ReuseStrategy implements RecommendationStrategy {
  readonly name        = 'Reutilizar';
  readonly strategyKey = 'reuseStrategy';

  generate(itemName: string, condition: string): RecommendationItem[] {
    const good = ['nuevo', 'bueno'].includes(condition);
    return [
      { title: `Donar "${itemName}" a una organización local`,        confidence: good ? 92 : 70, effort: 'bajo'  },
      { title: `Vender "${itemName}" en marketplace de segunda mano`, confidence: good ? 88 : 62, effort: 'bajo'  },
      { title: `Intercambiar en una comunidad de trueque`,            confidence: 74,             effort: 'medio' },
    ];
  }
}
