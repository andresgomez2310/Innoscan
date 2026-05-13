import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Controller()
export class IdeasController {
  constructor(private readonly service: IdeasService) {}

  @MessagePattern('ideas.findAll')
  findAll(@Payload() payload: { estado?: string }) {
    return this.service.findAll(payload?.estado);
  }

  @MessagePattern('ideas.create')
  create(@Payload() dto: CreateIdeaDto) {
    return this.service.create(dto);
  }

  @MessagePattern('ideas.updateEstado')
  updateEstado(@Payload() payload: { id: string; estado: string }) {
    return this.service.updateEstado(payload.id, payload.estado);
  }

  @MessagePattern('ideas.remove')
  remove(@Payload() payload: { id: string }) {
    return this.service.remove(payload.id);
  }
}