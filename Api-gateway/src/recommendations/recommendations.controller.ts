import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { RecommendationsClientService } from './recommendations.client.service';

@UseGuards(SupabaseAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsClientService) {}

  @Post('generate')
  generate(@Body() dto: any) {
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