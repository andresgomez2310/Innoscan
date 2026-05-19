import { Controller, Post, Get, Param, Body, Query, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { RecommendationsClientService } from './recommendations.client.service';

@UseGuards(SupabaseAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsClientService) {}

  @Post('generate')
 generate(@Body() dto: any, @Req() req: any) {
    const userId = req.user?.id; 
    return this.service.generate({ ...dto, user_id: userId });
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('transformationTypeId') typeId?: string,
    @Query('scanId') scanId?: string,
  ) {
    const userId = req.user.id;
    return this.service.findAll(typeId, scanId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}