import { RecommendationsService, GenerateRecommendationsDto } from './recommendations.service';
export declare class RecommendationsController {
    private readonly service;
    constructor(service: RecommendationsService);
    generate(dto: GenerateRecommendationsDto): Promise<any>;
    findAll(typeId?: string, scanId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
