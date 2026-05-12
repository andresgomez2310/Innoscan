// ══════════════════════════════════════════════════════════════
// PATRÓN BUILDER (Creacional)
//
// Construye RecommendationResult paso a paso.
// build() valida todos los campos antes de retornar el objeto —
// nunca existe un resultado incompleto en el sistema.
// ══════════════════════════════════════════════════════════════

export type Effort = 'bajo' | 'medio' | 'alto';

export interface RecommendationItem {
  title:      string;
  confidence: number;   // 0–100
  effort:     Effort;
}

export interface RecommendationResult {
  scanId:               string;
  transformationTypeId: string;
  strategyName:         string;
  recommendations:      RecommendationItem[];
  confidence:           number;   // promedio calculado automáticamente
  processingTimeMs:     number;
  status:               'COMPLETE';
}

export class RecommendationResultBuilder {
  private scanId:               string | null = null;
  private transformationTypeId: string | null = null;
  private strategyName:         string | null = null;
  private recommendations:      RecommendationItem[] = [];
  private readonly startedAt = Date.now();

  withScanId(id: string): this {
    this.scanId = id;
    return this;
  }

  withTransformationTypeId(id: string): this {
    this.transformationTypeId = id;
    return this;
  }

  withStrategyName(name: string): this {
    this.strategyName = name;
    return this;
  }

  withRecommendations(items: RecommendationItem[]): this {
    this.recommendations = items;
    return this;
  }

  build(): RecommendationResult {
    // Validaciones — el objeto no puede existir si está incompleto
    if (!this.scanId)
      throw new Error('[Builder] scanId es obligatorio');
    if (!this.transformationTypeId)
      throw new Error('[Builder] transformationTypeId es obligatorio');
    if (!this.strategyName)
      throw new Error('[Builder] strategyName es obligatorio');
    if (this.recommendations.length === 0)
      throw new Error('[Builder] debe incluir al menos una recomendación');

    // Confianza calculada automáticamente como promedio
    const confidence = Math.round(
      this.recommendations.reduce((s, r) => s + r.confidence, 0) /
      this.recommendations.length,
    );

    return {
      scanId:               this.scanId,
      transformationTypeId: this.transformationTypeId,
      strategyName:         this.strategyName,
      recommendations:      this.recommendations,
      confidence,
      processingTimeMs:     Date.now() - this.startedAt,
      status:               'COMPLETE',
    };
  }
}
