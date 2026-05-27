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
    const { data, error } = await this.db.from('feedback').insert({
      recomendacion_id: dto.resultId,
      rating:           dto.rating,
      comentario:       dto.comment ?? '',
      user_id:          dto.userId ?? null,
    }).select('*').single();
    if (error) throw new Error(error.message);
    return {
      id:        data.id,
      resultId:  data.recomendacion_id,
      rating:    data.rating,
      comment:   data.comentario,
      createdAt: data.created_at,
    };
  }

  async findAll(minRating?: number, resultId?: string) {
    let q = this.db.from('feedback').select('*')
      .order('created_at', { ascending: false });
    if (resultId) q = q.eq('recomendacion_id', resultId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((r: any) => ({
      id:        r.id,
      resultId:  r.recomendacion_id,
      rating:    r.rating,
      comment:   r.comentario,
      createdAt: r.created_at,
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