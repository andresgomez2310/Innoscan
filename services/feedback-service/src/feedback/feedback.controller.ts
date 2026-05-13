import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller()
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @MessagePattern('feedback.create')
  create(@Payload() dto: CreateFeedbackDto) {
    return this.service.create(dto);
  }

  @MessagePattern('feedback.findAll')
  findAll(@Payload() payload: { minRating?: number; resultId?: string }) {
    return this.service.findAll(payload?.minRating, payload?.resultId);
  }
}