import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): any {
    return (this.prisma as any).client;
  }

  async findAll(search?: string, categoria?: string) {
    let q = this.db.from('productos').select('*').order('created_at', { ascending: false });
    if (search)    q = q.ilike('nombre', `%${search}%`);
    if (categoria) q = q.eq('categoria', categoria);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getCategories() {
    const { data, error } = await this.db.from('productos').select('*').order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => ({ id: p.id, label: p.nombre, ...p }));
  }

  async create(dto: CreateProductoDto) {
    const { data, error } = await this.db.from('productos').insert({
      nombre:        dto.nombre,
      categoria:     dto.categoria ?? null,
      descripcion:   dto.descripcion ?? null,
      codigo_barras: dto.codigo_barras ?? null,
    }).select('*').single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db.from('productos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}