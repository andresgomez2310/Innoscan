import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export interface Category {
    id: string;
    label: string;
    [key: string]: any;
}
export interface TransformationType {
    id: string;
    strategyKey: string;
    [key: string]: any;
}
export declare const CONDITION_TAGS: readonly ["nuevo", "bueno", "regular", "dañado", "antiguo", "raro"];
export declare const EFFORT_LABELS: Record<string, string>;
export declare class FlyweightService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private categories;
    private transformationTypes;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getCategories(): Promise<Category[]>;
    getCategoryById(id: string): Promise<Category | undefined>;
    getTransformationTypes(): Promise<TransformationType[]>;
    getTransformationTypeById(id: string): Promise<TransformationType | undefined>;
    getConditionTags(): readonly ["nuevo", "bueno", "regular", "dañado", "antiguo", "raro"];
    getEffortLabels(): Record<string, string>;
    invalidateCache(): void;
    getCacheStats(): {
        categories: {
            cached: boolean;
            count: number;
        };
        transformationTypes: {
            cached: boolean;
            count: number;
        };
        conditionTags: {
            cached: boolean;
            count: 6;
        };
        effortLabels: {
            cached: boolean;
            count: number;
        };
    };
}
