import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';

@Injectable()
export class ScansService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): any {
    return (this.prisma as any).client;
  }

  async create(dto: CreateScanDto) {
    const { data, error } = await this.db.from('escaneos').insert({
      producto_id: dto.categoryId,
      notas:       dto.description ?? dto.itemName,
      ubicacion:   dto.condition,
    }).select('*, category:productos(*)').single();
    if (error) throw new Error(error.message);
    return this.mapScan(data);
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const { data, error, count } = await this.db
      .from('escaneos')
      .select('*, category:productos(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);
    if (error) throw new Error(error.message);
    const total = count ?? 0;
    return { data: (data ?? []).map((r: any) => this.mapScan(r)), total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('escaneos')
      .select('*, category:productos(*), results:recomendaciones(*)')
      .eq('id', id).single();
    if (error) throw new Error(error.message);
    return this.mapScan(data);
  }

  async update(id: string, dto: UpdateScanDto) {
    const update: any = {};
    if (dto.condition)   update.ubicacion = dto.condition;
    if (dto.description) update.notas     = dto.description;
    const { data, error } = await this.db
      .from('escaneos').update(update).eq('id', id)
      .select('*, category:productos(*)').single();
    if (error) throw new Error(error.message);
    return this.mapScan(data);
  }

  async getStats() {
    const { data, error, count } = await this.db
      .from('escaneos').select('ubicacion', { count: 'exact' });
    if (error) throw new Error(error.message);
    const groups: Record<string, number> = {};
    for (const row of data ?? []) {
      const key = row.ubicacion ?? 'PENDING';
      groups[key] = (groups[key] ?? 0) + 1;
    }
    return { total: count ?? 0, byStatus: Object.entries(groups).map(([status, c]) => ({ status, _count: { _all: c } })) };
  }

  async remove(id: string) {
    const { error } = await this.db.from('escaneos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }

  private mapScan(row: any) {
    if (!row) return null;
    return {
      ...row,
      itemName:   row.notas ?? '',
      categoryId: row.producto_id,
      condition:  row.ubicacion ?? 'bueno',
      status:     'PENDING',
      createdAt:  row.created_at,
    };
  }
}