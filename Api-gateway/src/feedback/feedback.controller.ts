import { Controller, Post, Get, Body, Query, ParseIntPipe, DefaultValuePipe, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { FeedbackClientService } from './feedback.client.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@UseGuards(SupabaseAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackClientService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto, @Req() req: any) {
    return this.service.create({ ...dto, userId: req.user.id })
  }

  @Get()
  findAll(
    @Query('minRating', new DefaultValuePipe(0), ParseIntPipe) minRating: number,
    @Query('resultId') resultId?: string,
  ) {
    return this.service.findAll(minRating || undefined, resultId);
  }
}