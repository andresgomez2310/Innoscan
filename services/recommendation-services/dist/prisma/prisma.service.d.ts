import { SupabaseClient } from '@supabase/supabase-js';
export declare class PrismaService {
    private client;
    constructor();
    get scan(): ScanTable;
    get category(): CategoryTable;
    get transformationType(): TransformationTypeTable;
    get recommendationResult(): RecommendationResultTable;
    get feedback(): FeedbackTable;
}
declare class ScanTable {
    private db;
    constructor(db: SupabaseClient);
    create({ data }: any): Promise<any>;
    findMany({ skip, take }?: any): Promise<any[]>;
    findUnique({ where }: any): Promise<any>;
    count(): Promise<number>;
    update({ where, data }: any): Promise<any>;
    groupBy(_args: any): Promise<{
        status: string;
        _count: {
            _all: number;
        };
    }[]>;
    private mapScan;
}
declare class CategoryTable {
    private db;
    constructor(db: SupabaseClient);
    findMany(_args?: any): Promise<any[]>;
}
declare class TransformationTypeTable {
    private db;
    private static readonly types;
    constructor(db: SupabaseClient);
    findMany(): Promise<{
        id: string;
        label: string;
        strategyKey: string;
    }[]>;
}
declare class RecommendationResultTable {
    private db;
    constructor(db: SupabaseClient);
    create({ data }: any): Promise<any>;
    findMany({ where }?: any): Promise<any[]>;
    findUnique({ where }: any): Promise<any>;
    private mapResult;
}
declare class FeedbackTable {
    private db;
    constructor(db: SupabaseClient);
    create({ data }: any): Promise<any>;
    findMany({ where }?: any): Promise<any[]>;
    aggregate({ where }: any): Promise<{
        _avg: {
            rating: number;
        };
        _count: {
            _all: number;
        };
    }>;
}
export {};
