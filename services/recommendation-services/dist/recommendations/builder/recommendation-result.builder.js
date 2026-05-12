"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationResultBuilder = void 0;
class RecommendationResultBuilder {
    constructor() {
        this.scanId = null;
        this.transformationTypeId = null;
        this.strategyName = null;
        this.recommendations = [];
        this.startedAt = Date.now();
    }
    withScanId(id) {
        this.scanId = id;
        return this;
    }
    withTransformationTypeId(id) {
        this.transformationTypeId = id;
        return this;
    }
    withStrategyName(name) {
        this.strategyName = name;
        return this;
    }
    withRecommendations(items) {
        this.recommendations = items;
        return this;
    }
    build() {
        if (!this.scanId)
            throw new Error('[Builder] scanId es obligatorio');
        if (!this.transformationTypeId)
            throw new Error('[Builder] transformationTypeId es obligatorio');
        if (!this.strategyName)
            throw new Error('[Builder] strategyName es obligatorio');
        if (this.recommendations.length === 0)
            throw new Error('[Builder] debe incluir al menos una recomendación');
        const confidence = Math.round(this.recommendations.reduce((s, r) => s + r.confidence, 0) /
            this.recommendations.length);
        return {
            scanId: this.scanId,
            transformationTypeId: this.transformationTypeId,
            strategyName: this.strategyName,
            recommendations: this.recommendations,
            confidence,
            processingTimeMs: Date.now() - this.startedAt,
            status: 'COMPLETE',
        };
    }
}
exports.RecommendationResultBuilder = RecommendationResultBuilder;
//# sourceMappingURL=recommendation-result.builder.js.map