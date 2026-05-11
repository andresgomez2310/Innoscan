// feedback.controller.ts
import { Controller, Post, Get, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { FeedbackService }   from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Post()  create(@Body() dto: CreateFeedbackDto) { return this.service.create(dto); }
  @Get()   findAll(
    @Query('minRating', new DefaultValuePipe(0), ParseIntPipe) minRating: number,
    @Query('resultId') resultId?: string,
  ) { return this.service.findAll(minRating || undefined, resultId); }
}
