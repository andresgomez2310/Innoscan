// feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }     from '../prisma/prisma.service';
import { ScanEventsService } from '../shared/observer/scan-events.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly events:  ScanEventsService,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const result = await this.prisma.recommendationResult.findUnique({ where: { id: dto.resultId } });
    if (!result) throw new NotFoundException(`Resultado "${dto.resultId}" no encontrado`);

    const fb = await this.prisma.feedback.create({
      data: { resultId: dto.resultId, rating: dto.rating, comment: dto.comment },
    });
    this.events.notifyFeedbackSubmitted({ resultId: dto.resultId, rating: dto.rating }); // Observer
    return fb;
  }

  async findAll(minRating?: number, resultId?: string) {
    const where: any = {};
    if (resultId)  where.resultId = resultId;
    if (minRating) where.rating   = { gte: minRating };

    const [data, agg] = await Promise.all([
      this.prisma.feedback.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.feedback.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
    ]);
    return { data, stats: { total: agg._count._all, avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10 } };
  }
}
