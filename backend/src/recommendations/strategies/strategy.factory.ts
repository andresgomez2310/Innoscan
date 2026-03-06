// ══════════════════════════════════════════════════════════════
// STRATEGY FACTORY
// Instancias únicas reutilizadas — no se crea new Xyz() en cada request.
// El strategyKey viene del TransformationType (Flyweight cache).
// ══════════════════════════════════════════════════════════════
import { BadRequestException }    from '@nestjs/common';
import { RecommendationStrategy } from './recommendation.strategy';
import { ReuseStrategy }          from './reuse.strategy';
import { TransformStrategy }      from './transform.strategy';
import { ReconfigureStrategy }    from './reconfigure.strategy';

export class StrategyFactory {
  private static readonly strategies: Record<string, RecommendationStrategy> = {
    reuseStrategy:       new ReuseStrategy(),
    transformStrategy:   new TransformStrategy(),
    reconfigureStrategy: new ReconfigureStrategy(),
  };

  static create(strategyKey: string): RecommendationStrategy {
    const s = this.strategies[strategyKey];
    if (!s) throw new BadRequestException(
      `[Strategy] Clave desconocida: "${strategyKey}". Válidas: ${Object.keys(this.strategies).join(', ')}`,
    );
    return s;
  }
}
