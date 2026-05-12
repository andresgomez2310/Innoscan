import { PrismaService } from '../prisma/prisma.service';
import { FlyweightService } from '../shared/flyweight/flyweight.service';
import { ScanEventsService } from '../shared/observer/scan-events.service';
export declare class GenerateRecommendationsDto {
    scanId: string;
    transformationTypeId: string;
    itemName?: string;
}
export declare class RecommendationsService {
    private readonly prisma;
    private readonly flyweight;
    private readonly events;
    constructor(prisma: PrismaService, flyweight: FlyweightService, events: ScanEventsService);
    generate(dto: GenerateRecommendationsDto): Promise<any>;
    findAll(transformationTypeId?: string, scanId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
