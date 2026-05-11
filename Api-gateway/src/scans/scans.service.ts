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

  async create(dto: CreateScanDto) {
    const category = await this.flyweight.getCategoryById(dto.categoryId);
    if (!category) throw new NotFoundException(`Categoría "${dto.categoryId}" no existe`);

    const scan = await this.prisma.scan.create({
      data: { ...dto, tags: dto.tags ?? [], status: 'PENDING' },
      include: { category: true },
    });
    this.events.notifyScanCreated(scan);
    return scan;
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.scan.findMany({
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.scan.count(),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
      include: { category: true, results: { include: { transformationType: true } } },
    });
    if (!scan) throw new NotFoundException(`Scan "${id}" no encontrado`);
    return scan;
  }

  async update(id: string, dto: UpdateScanDto) {
    await this.findOne(id);
    return this.prisma.scan.update({ where: { id }, data: dto, include: { category: true } });
  }

  async getStats() {
    const [byStatus, total] = await Promise.all([
      this.prisma.scan.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.scan.count(),
    ]);
    return { total, byStatus };
  }

  async remove(id: string) {
    const supabase = (this.prisma as any).client;
    const { error } = await supabase.from('escaneos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true, id };
  }
}