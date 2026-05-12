// recommendations.controller.ts

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  RecommendationsService,
  GenerateRecommendationsDto,
} from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {

  constructor(
    private readonly service: RecommendationsService,
  ) {}

  @Post('generate')
  generate(@Body() dto: GenerateRecommendationsDto) {
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
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(id);
  }
}
