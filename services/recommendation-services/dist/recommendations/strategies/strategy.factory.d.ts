import { RecommendationStrategy } from './recommendation.strategy';
export declare class StrategyFactory {
    private static readonly strategies;
    static create(strategyKey: string): RecommendationStrategy;
}
