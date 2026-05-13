import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): any {
    return (this.prisma as any).client;
  }

  async findAll(estado?: string) {
    let q = this.db.from('ideas').select('*, productos(nombre)').order('created_at', { ascending: false });
    if (estado) q = q.eq('estado', estado);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async create(dto: CreateIdeaDto) {
    const { data, error } = await this.db.from('ideas').insert({
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
    const { data, error } = await this.db.from('ideas').update({ estado }).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db.from('ideas').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}