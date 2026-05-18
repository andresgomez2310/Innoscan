import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecommendationsService, GenerateRecommendationsDto } from './recommendations.service';

@Controller()
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @MessagePattern('recommendations.generate')
  generate(@Payload() dto: GenerateRecommendationsDto) {
    return this.service.generate(dto);
  }

  @MessagePattern('recommendations.findAll')
  findAll(@Payload() payload: { transformationTypeId?: string; scanId?: string }) {
    return this.service.findAll(payload?.transformationTypeId, payload?.scanId);
  }

  @MessagePattern('recommendations.findOne')
  findOne(@Payload() payload: { id: string }) {
    return this.service.findOne(payload.id);
  }
}