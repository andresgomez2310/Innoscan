// catalog.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { FlyweightService } from '../shared/flyweight/flyweight.service';

@Controller()
export class CatalogController {
  constructor(private readonly flyweight: FlyweightService) {}

  @Get('categories')         getCategories()         { return this.flyweight.getCategories(); }
  @Get('transformation-types') getTypes()            { return this.flyweight.getTransformationTypes(); }
  @Get('flyweight/stats')    getStats()              { return this.flyweight.getCacheStats(); }
  @Post('flyweight/invalidate') invalidate()         { this.flyweight.invalidateCache(); return { ok: true }; }
}
