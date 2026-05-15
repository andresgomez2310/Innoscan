import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationsClientService {
  constructor(@Inject('RECOMMENDATION_SERVICE') private readonly client: ClientProxy) {}

  async generate(dto: any) {
    console.log('Mandando a RabbitMQ:', JSON.stringify(dto).substring(0, 100) + '...');
    return firstValueFrom(
      this.client.send('recommendations.generate', JSON.parse(JSON.stringify(dto)))
    );
  }

  findAll(transformationTypeId?: string, scanId?: string) {
    return firstValueFrom(this.client.send('recommendations.findAll', { transformationTypeId, scanId }));
  }

  findOne(id: string) {
    return firstValueFrom(this.client.send('recommendations.findOne', { id }));
  }
}