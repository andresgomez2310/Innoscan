import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): any {
    return (this.prisma as any).client;
  }

  async create(dto: CreateFeedbackDto) {
    const { data, error } = await this.db.from('ideas').insert({
      titulo:      `Feedback ${dto.rating}/5`,
      descripcion: dto.comment ?? `Rating: ${dto.rating}`,
      categoria:   'feedback',
      producto_id: dto.resultId,
    }).select('*').single();
    if (error) throw new Error(error.message);
    return { ...data, resultId: dto.resultId, rating: dto.rating, comment: dto.comment };
  }

  async findAll(minRating?: number, resultId?: string) {
    let q = this.db.from('ideas').select('*').eq('categoria', 'feedback')
      .order('created_at', { ascending: false });
    if (resultId) q = q.eq('producto_id', resultId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((r: any) => ({
      ...r,
      resultId: r.producto_id,
      rating:   parseInt(r.titulo?.match(/\d+/)?.[0] ?? '3'),
      comment:  r.descripcion,
    }));

    const filtered = minRating ? rows.filter((r: any) => r.rating >= minRating) : rows;
    const avg = filtered.length
      ? filtered.reduce((s: number, r: any) => s + r.rating, 0) / filtered.length
      : 0;

    return {
      data: filtered,
      stats: { total: filtered.length, avgRating: Math.round(avg * 10) / 10 },
    };
  }
}