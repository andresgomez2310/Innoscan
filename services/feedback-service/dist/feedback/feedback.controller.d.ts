import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackController {
    private readonly service;
    constructor(service: FeedbackService);
    create(dto: CreateFeedbackDto): Promise<any>;
    findAll(payload: {
        minRating?: number;
        resultId?: string;
    }): Promise<{
        data: any;
        stats: {
            total: any;
            avgRating: number;
        };
    }>;
}
