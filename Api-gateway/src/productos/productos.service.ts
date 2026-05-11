import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

function getSupabase(prisma: PrismaService): any {
  return (prisma as any).client;
}

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, categoria?: string) {
    const supabase = getSupabase(this.prisma);
    let q = supabase.from('productos').select('*').order('created_at', { ascending: false });
    if (search)    q = q.ilike('nombre', `%${search}%`);
    if (categoria) q = q.eq('categoria', categoria);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async create(dto: CreateProductoDto) {
    const supabase = getSupabase(this.prisma);
    const { data, error } = await supabase.from('productos').insert({
      nombre:        dto.nombre,
      categoria:     dto.categoria ?? null,
      descripcion:   dto.descripcion ?? null,
      codigo_barras: dto.codigo_barras ?? null,
    }).select('*').single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const supabase = getSupabase(this.prisma);
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}
