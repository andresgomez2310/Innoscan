import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }     from '../prisma/prisma.service';
import { FlyweightService }  from '../shared/flyweight/flyweight.service';
import { ScanEventsService } from '../shared/observer/scan-events.service';
import { CreateScanDto }     from './dto/create-scan.dto';
import { UpdateScanDto }     from './dto/update-scan.dto';

@Injectable()
export class ScansService {
  constructor(
    private readonly prisma:    PrismaService,
    private readonly flyweight: FlyweightService,
    private readonly events:    ScanEventsService,
  ) {}

  /**
   * Crea un escaneo vinculado al usuario
   */
  async create(userId: string, dto: CreateScanDto) {
    const category = await this.flyweight.getCategoryById(dto.categoryId);
    if (!category) throw new NotFoundException(`Categoría "${dto.categoryId}" no existe`);

    const scan = await this.prisma.scan.create({
      data: { 
        ...dto, 
        user_id: userId, // <--- VINCULACIÓN AL USUARIO
        tags: dto.tags ?? [], 
        status: 'PENDING' 
      },
      include: { category: true },
    });
    this.events.notifyScanCreated(scan);
    return scan;
  }

  /**
   * Obtiene los escaneos filtrados por usuario
   */
  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.scan.findMany({
        where: { user_id: userId }, // <--- FILTRO DE USUARIO
        skip: (page - 1) * limit, 
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      (this.prisma.scan as any).count({
  where: { user_id: userId },
}),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Busca un escaneo específico solo si pertenece al usuario
   */
  async findOne(id: string, userId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { 
        id,
        user_id: userId // <--- SEGURIDAD: Solo el dueño puede verlo
      } as any, // 'as any' si el schema de Prisma no reconoce la llave compuesta aún
      include: { category: true, results: { include: { transformationType: true } } },
    });
    if (!scan) throw new NotFoundException(`Scan "${id}" no encontrado para este usuario`);
    return scan;
  }

  async update(id: string, userId: string, dto: UpdateScanDto) {
    await this.findOne(id, userId); // Valida propiedad antes de actualizar
    return this.prisma.scan.update({ 
      where: { id }, 
      data: dto, 
      include: { category: true } 
    });
  }

  /**
   * Estadísticas personalizadas para el Dashboard
   */
  async getStats(userId: string) {
    const [byStatus, total] = await Promise.all([
      this.prisma.scan.groupBy({ 
        by: ['status'], 
        where: { user_id: userId }, // <--- ESTO ARREGLA TU DASHBOARD
        _count: { _all: true } 
      }),
      (this.prisma.scan as any).count({
  where: { user_id: userId },
}),
    ]);
    return { total, byStatus };
  }

  /**
   * Borrado seguro por usuario
   */
  async remove(id: string, userId: string) {
    const supabase = (this.prisma as any).client;
    const { error } = await supabase
      .from('escaneos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // <--- FILTRO DE PROPIEDAD

    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}