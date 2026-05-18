import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationsClientService {
  constructor(@Inject('RECOMMENDATION_SERVICE') private readonly client: ClientProxy) {}

  generate(dto: any) {
    return firstValueFrom(this.client.send('recommendations.generate', dto));
  }

  findAll(transformationTypeId?: string, scanId?: string) {
    return firstValueFrom(this.client.send('recommendations.findAll', { transformationTypeId, scanId }));
  }

  findOne(id: string) {
    return firstValueFrom(this.client.send('recommendations.findOne', { id }));
  }
}