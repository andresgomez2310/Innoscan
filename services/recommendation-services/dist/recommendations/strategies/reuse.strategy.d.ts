import { RecommendationItem } from '../builder/recommendation-result.builder';
import { RecommendationStrategy } from './recommendation.strategy';
export declare class ReuseStrategy implements RecommendationStrategy {
    readonly name = "Reutilizar";
    readonly strategyKey = "reuseStrategy";
    generate(itemName: string, condition: string): RecommendationItem[];
}
