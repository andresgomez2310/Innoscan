import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecommendationsService, GenerateRecommendationsDto } from './recommendations.service';

@Controller()
export class RecommendationsController {
  private readonly logger = new Logger('RecommendationsController');

  constructor(private readonly service: RecommendationsService) {}

  @MessagePattern('recommendations.generate')
  generate(@Payload() dto: GenerateRecommendationsDto) {
    this.logger.log('generate called with: ' + JSON.stringify(dto));
    return this.service.generate(dto);
  }

  @MessagePattern('recommendations.findAll')
  findAll(@Payload() payload: { transformationTypeId?: string; scanId?: string }) {
    this.logger.log('findAll called');
    return this.service.findAll(payload?.transformationTypeId, payload?.scanId);
  }

  @MessagePattern('recommendations.findOne')
  findOne(@Payload() payload: { id: string }) {
    this.logger.log('findOne called with: ' + JSON.stringify(payload));
    return this.service.findOne(payload.id);
  }
}