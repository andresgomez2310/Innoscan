import { RecommendationItem } from '../builder/recommendation-result.builder';
import { RecommendationStrategy } from './recommendation.strategy';
export declare class TransformStrategy implements RecommendationStrategy {
    readonly name = "Transformar";
    readonly strategyKey = "transformStrategy";
    generate(itemName: string, condition: string): RecommendationItem[];
}
