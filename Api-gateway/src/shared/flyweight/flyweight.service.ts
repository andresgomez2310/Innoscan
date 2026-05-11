import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface Category {
  id: string;
  label: string;
  [key: string]: any;
}

export interface TransformationType {
  id: string;
  strategyKey: string;
  [key: string]: any;
}

export const CONDITION_TAGS = ['nuevo','bueno','regular','dañado','antiguo','raro'] as const;
export const EFFORT_LABELS: Record<string, string> = {
  bajo:  '🟢 Bajo',
  medio: '🟡 Medio',
  alto:  '🔴 Alto',
};

@Injectable()
export class FlyweightService implements OnModuleInit {
  private readonly logger = new Logger('Flyweight');
  private categories:          Category[]           | null = null;
  private transformationTypes: TransformationType[] | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await Promise.all([this.getCategories(), this.getTransformationTypes()]);
    this.logger.log(
      `Cache listo — ${this.categories!.length} categorías, ` +
      `${this.transformationTypes!.length} tipos, ` +
      `${CONDITION_TAGS.length} etiquetas estáticas`,
    );
  }

  async getCategories(): Promise<Category[]> {
    if (!this.categories)
      this.categories = await this.prisma.category.findMany({ orderBy: { label: 'asc' } });
    return this.categories;
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return (await this.getCategories()).find(c => c.id === id);
  }

  async getTransformationTypes(): Promise<TransformationType[]> {
    if (!this.transformationTypes)
      this.transformationTypes = await this.prisma.transformationType.findMany();
    return this.transformationTypes;
  }

  async getTransformationTypeById(id: string): Promise<TransformationType | undefined> {
    return (await this.getTransformationTypes()).find(t => t.id === id);
  }

  getConditionTags()  { return CONDITION_TAGS; }
  getEffortLabels()   { return EFFORT_LABELS;  }

  invalidateCache() {
    this.categories = null;
    this.transformationTypes = null;
    this.logger.warn('Cache invalidado');
  }

  getCacheStats() {
    return {
      categories:          { cached: !!this.categories,          count: this.categories?.length ?? 0 },
      transformationTypes: { cached: !!this.transformationTypes, count: this.transformationTypes?.length ?? 0 },
      conditionTags:       { cached: true, count: CONDITION_TAGS.length },
      effortLabels:        { cached: true, count: Object.keys(EFFORT_LABELS).length },
    };
  }
}
