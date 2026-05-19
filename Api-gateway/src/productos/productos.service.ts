import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

function getSupabase(prisma: PrismaService): any {
  return (prisma as any).client;
}

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene solo los productos del usuario autenticado
   */
  async findAll(userId: string, search?: string, categoria?: string) {
    const supabase = getSupabase(this.prisma);
    
    // 1. Iniciamos la consulta filtrando obligatoriamente por user_id
    let q = supabase
      .from('productos')
      .select('*')
      .eq('user_id', userId) // <--- ESTE ES EL FILTRO MAESTRO
      .order('created_at', { ascending: false });

    // 2. Aplicamos filtros opcionales de búsqueda
    if (search)    q = q.ilike('nombre', `%${search}%`);
    if (categoria) q = q.eq('categoria', categoria);

    const { data, error } = await q;
    
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  /**
   * Crea un producto vinculado al usuario
   */
  async create(userId: string, dto: CreateProductoDto) {
    const supabase = getSupabase(this.prisma);
    
    const { data, error } = await supabase.from('productos').insert({
      nombre:        dto.nombre,
      categoria:     dto.categoria ?? null,
      descripcion:   dto.descripcion ?? null,
      codigo_barras: dto.codigo_barras ?? null,
      user_id:       userId, // <--- VINCULAMOS EL PRODUCTO AL USUARIO
    }).select('*').single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Elimina un producto solo si pertenece al usuario (Seguridad)
   */
  async remove(userId: string, id: string) {
    const supabase = getSupabase(this.prisma);
    
    // Filtramos por ID y por USER_ID para evitar que alguien borre productos ajenos
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); 

    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}