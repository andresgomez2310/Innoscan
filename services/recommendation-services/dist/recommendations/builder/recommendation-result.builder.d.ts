export type Effort = 'bajo' | 'medio' | 'alto';
export interface RecommendationItem {
    title: string;
    confidence: number;
    effort: Effort;
}
export interface RecommendationResult {
    scanId: string;
    transformationTypeId: string;
    strategyName: string;
    recommendations: RecommendationItem[];
    confidence: number;
    processingTimeMs: number;
    status: 'COMPLETE';
}
export declare class RecommendationResultBuilder {
    private scanId;
    private transformationTypeId;
    private strategyName;
    private recommendations;
    private readonly startedAt;
    withScanId(id: string): this;
    withTransformationTypeId(id: string): this;
    withStrategyName(name: string): this;
    withRecommendations(items: RecommendationItem[]): this;
    build(): RecommendationResult;
}
