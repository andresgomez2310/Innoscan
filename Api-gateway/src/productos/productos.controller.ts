import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { CatalogClientService } from '../catalog/catalog.client.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@UseGuards(SupabaseAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly catalog: CatalogClientService) {}

  @Get()
  findAll() {
    return this.catalog.findAll();
  }

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.catalog.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalog.remove(id);
  }
}