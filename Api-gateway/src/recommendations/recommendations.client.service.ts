import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationsClientService {
  constructor(
    @Inject('RECOMMENDATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  generate(payload: any) {
    return firstValueFrom(
      this.client.send('recommendations.generate', payload),
    );
  }

  findAll(userId?: string, transformationTypeId?: string, scanId?: string) {
    return firstValueFrom(
      this.client.send('recommendations.findAll', {
        userId,
        transformationTypeId,
        scanId,
      }),
    );
  }

  findOne(id: string) {
    return firstValueFrom(
      this.client.send('recommendations.findOne', { id }),
    );
  }
}