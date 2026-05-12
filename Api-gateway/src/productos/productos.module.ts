import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { CatalogClientModule } from '../catalog/catalog.client.module';

@Module({
  imports: [CatalogClientModule],
  controllers: [ProductosController],
})
export class ProductosModule {}