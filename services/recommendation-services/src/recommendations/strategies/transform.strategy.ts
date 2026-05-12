import { RecommendationItem } from '../builder/recommendation-result.builder';
import { RecommendationStrategy } from './recommendation.strategy';

export class TransformStrategy implements RecommendationStrategy {
  readonly name        = 'Transformar';
  readonly strategyKey = 'transformStrategy';

  generate(itemName: string, condition: string): RecommendationItem[] {
    const repairable = ['regular', 'dañado'].includes(condition);
    return [
      { title: `Upcycling: convertir "${itemName}" en elemento decorativo`, confidence: repairable ? 75 : 68, effort: 'alto'  },
      { title: `Desmontar "${itemName}" para extraer piezas reutilizables`,  confidence: 85,                  effort: 'medio' },
      { title: `Llevar a taller DIY comunitario`,                            confidence: 65,                  effort: 'alto'  },
    ];
  }
}
