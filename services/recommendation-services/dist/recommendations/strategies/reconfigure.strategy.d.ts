import { RecommendationItem } from '../builder/recommendation-result.builder';
import { RecommendationStrategy } from './recommendation.strategy';
export declare class ReconfigureStrategy implements RecommendationStrategy {
    readonly name = "Reconfigurar";
    readonly strategyKey = "reconfigureStrategy";
    generate(itemName: string, condition: string): RecommendationItem[];
}
