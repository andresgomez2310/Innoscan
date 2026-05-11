import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}
  @Get()           findAll(@Query('search') search?: string, @Query('categoria') categoria?: string) { return this.service.findAll(search, categoria); }
  @Post()          create(@Body() dto: CreateProductoDto)  { return this.service.create(dto); }
  @Delete(':id')   remove(@Param('id') id: string)         { return this.service.remove(id); }
}
