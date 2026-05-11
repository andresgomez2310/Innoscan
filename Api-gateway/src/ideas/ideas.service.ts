import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

function getSupabase(prisma: PrismaService): any {
  return (prisma as any).client;
}

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(estado?: string) {
    const supabase = getSupabase(this.prisma);
    let q = supabase.from('ideas').select('*, productos(nombre)').order('created_at', { ascending: false });
    if (estado) q = q.eq('estado', estado);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async create(dto: CreateIdeaDto) {
    const supabase = getSupabase(this.prisma);
    const { data, error } = await supabase.from('ideas').insert({
      titulo:      dto.titulo,
      descripcion: dto.descripcion,
      producto_id: dto.producto_id ?? null,
      categoria:   dto.categoria ?? null,
      estado:      dto.estado ?? 'activa',
    }).select('*, productos(nombre)').single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateEstado(id: string, estado: string) {
    const supabase = getSupabase(this.prisma);
    const { data, error } = await supabase.from('ideas').update({ estado }).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const supabase = getSupabase(this.prisma);
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}
