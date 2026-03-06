// ══════════════════════════════════════════════════════════════
// RecommendationsService — los 4 patrones convergen aquí:
//   Flyweight  → TransformationType desde cache (sin query DB)
//   Strategy   → algoritmo seleccionado por strategyKey
//   Builder    → construye resultado validado paso a paso
//   Observer   → notifica parcial (25%, 70%) y completo (100%)
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsUUID, IsString, IsOptional } from 'class-validator';
import { PrismaService }        from '../prisma/prisma.service';
import { FlyweightService }     from '../shared/flyweight/flyweight.service';
import { ScanEventsService }    from '../shared/observer/scan-events.service';
import { RecommendationResultBuilder } from './builder/recommendation-result.builder';
import { StrategyFactory }      from './strategies/strategy.factory';

export class GenerateRecommendationsDto {
  @IsUUID()   scanId: string;
  @IsUUID()   transformationTypeId: string;
  @IsOptional() @IsString() itemName?: string;
}

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma:    PrismaService,
    private readonly flyweight: FlyweightService,  // Flyweight
    private readonly events:    ScanEventsService, // Observer
  ) {}

  async generate(dto: GenerateRecommendationsDto) {
    // 1. Obtener scan
    const scan = await this.prisma.scan.findUnique({ where: { id: dto.scanId } });
    if (!scan) throw new NotFoundException(`Scan "${dto.scanId}" no encontrado`);

    // 2. FLYWEIGHT: TransformationType desde cache (sin ir a DB)
    const tType = await this.flyweight.getTransformationTypeById(dto.transformationTypeId);
    if (!tType) throw new BadRequestException('TransformationType inválido');

    // 3. OBSERVER: notificar resultado parcial 25%
    this.events.notifyRecsPartial({ scanId: dto.scanId, progress: 25, message: `Analizando "${scan.itemName}"...` });

    // 4. STRATEGY: seleccionar y ejecutar el algoritmo correcto
    const strategy = StrategyFactory.create(tType.strategyKey);
    const items    = strategy.generate(dto.itemName ?? scan.itemName, scan.condition);

    // 5. OBSERVER: notificar resultado parcial 70%
    this.events.notifyRecsPartial({ scanId: dto.scanId, progress: 70, message: `Estrategia "${strategy.name}" aplicada...` });

    // 6. BUILDER: construir resultado validado paso a paso
    const built = new RecommendationResultBuilder()
      .withScanId(dto.scanId)
      .withTransformationTypeId(tType.id)
      .withStrategyName(strategy.name)
      .withRecommendations(items)
      .build();  // lanza Error si falta algo

    // 7. Persistir en PostgreSQL
    const saved = await this.prisma.recommendationResult.create({
      data: {
        scanId:               built.scanId,
        transformationTypeId: built.transformationTypeId,
        recommendations:      built.recommendations as any,
        confidence:           built.confidence,
        processingTimeMs:     built.processingTimeMs,
        status:               'COMPLETE',
      },
      include: { scan: { include: { category: true } }, transformationType: true },
    });

    // 8. Actualizar estado del scan
    await this.prisma.scan.update({ where: { id: dto.scanId }, data: { status: 'PROCESSED' } });

    // 9. OBSERVER: notificar resultado COMPLETO
    this.events.notifyRecsComplete({
      resultId: saved.id, scanId: dto.scanId,
      strategyName: strategy.name, confidence: built.confidence,
    });

    return saved;
  }

  async findAll(transformationTypeId?: string, scanId?: string) {
    return this.prisma.recommendationResult.findMany({
      where: {
        ...(transformationTypeId && { transformationTypeId }),
        ...(scanId && { scanId }),
      },
      include: { transformationType: true, scan: true, feedback: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.recommendationResult.findUnique({
      where: { id },
      include: { transformationType: true, scan: { include: { category: true } }, feedback: true },
    });
    if (!r) throw new NotFoundException(`Resultado "${id}" no encontrado`);
    return r;
  }
}
