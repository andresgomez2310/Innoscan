// api-gateway/src/recommendations/recommendations.controller.ts

import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { RecommendationsClientService } from './recommendations.client.service';
import { GenerateRecommendationsDto } from './dto/generate-recommendations.dto';

@Controller('recommendations')
export class RecommendationsController {
  // Usamos 'service' como nombre único para el constructor
  constructor(private readonly service: RecommendationsClientService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateRecommendationsDto) {
    // Esto envía el comando al microservicio por RabbitMQ
    return this.service.generate(dto);
  }

  @Get()
  findAll(
    @Query('transformationTypeId') typeId?: string,
    @Query('scanId') scanId?: string,
  ) {
    return this.service.findAll(typeId, scanId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}