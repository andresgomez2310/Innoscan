import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScansClientService {
  constructor(
    @Inject('RECOMMENDATION_SERVICE') private readonly client: ClientProxy
  ) {}

  create(dto: any) {
    return firstValueFrom(
      this.client.send('scans.create', dto)
    );
  }

  findAll(userId: string, page?: number, limit?: number) {
    return firstValueFrom(
      this.client.send('scans.findAll', { userId, page, limit })
    );
  }

  findOne(id: string, userId: string) {
    return firstValueFrom(
      this.client.send('scans.findOne', { id, userId })
    );
  }

  update(id: string, userId: string, dto: any) {
    return firstValueFrom(
      this.client.send('scans.update', { id, userId, dto })
    );
  }

  getStats(userId: string) {
    return firstValueFrom(
      this.client.send('scans.getStats', { userId })
    );
  }

  remove(id: string, userId: string) {
    return firstValueFrom(
      this.client.send('scans.remove', { id, userId })
    );
  }
}