import { Controller, Get, Post, Delete, Patch, Param, Body, Query } from '@nestjs/common';
import { FeedbackClientService } from '../feedback/feedback.client.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly service: FeedbackClientService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.service.findAllIdeas(estado);
  }

  @Post()
  create(@Body() dto: CreateIdeaDto) {
    return this.service.createIdea(dto);
  }

  @Patch(':id')
  updateEstado(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.service.updateEstado(id, body.estado);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeIdea(id);
  }
}