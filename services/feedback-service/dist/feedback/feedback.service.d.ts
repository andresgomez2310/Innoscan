import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    create(dto: CreateFeedbackDto): Promise<any>;
    findAll(minRating?: number, resultId?: string): Promise<{
        data: any;
        stats: {
            total: any;
            avgRating: number;
        };
    }>;
}
