import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CatalogService } from './catalog.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Controller()
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @MessagePattern('catalog.findAll')
  findAll(@Payload() payload: { search?: string; categoria?: string }) {
    return this.service.findAll(payload?.search, payload?.categoria);
  }

  @MessagePattern('catalog.getCategories')
  getCategories() {
    return this.service.getCategories();
  }

  @MessagePattern('catalog.create')
  create(@Payload() dto: CreateProductoDto) {
    return this.service.create(dto);
  }

  @MessagePattern('catalog.remove')
  remove(@Payload() payload: { id: string }) {
    return this.service.remove(payload.id);
  }
}