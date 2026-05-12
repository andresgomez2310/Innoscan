import { Controller, Get } from '@nestjs/common';
import { CatalogClientService } from './catalog.client.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogClientService) {}

  @Get('categories')
  getCategories() { return this.catalog.getCategories(); }

  @Get('transformation-types')
  getTypes() {
    return [
      { id: '1', label: 'Reutilizar',   strategyKey: 'reuseStrategy' },
      { id: '2', label: 'Transformar',  strategyKey: 'transformStrategy' },
      { id: '3', label: 'Reconfigurar', strategyKey: 'reconfigureStrategy' },
    ];
  }
}