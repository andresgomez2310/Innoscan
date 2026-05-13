import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScansClientService {
  constructor(@Inject('RECOMMENDATION_SERVICE') private readonly client: ClientProxy) {}

  create(dto: any) {
    return firstValueFrom(this.client.send('scans.create', dto));
  }

  findAll(page?: number, limit?: number) {
    return firstValueFrom(this.client.send('scans.findAll', { page, limit }));
  }

  findOne(id: string) {
    return firstValueFrom(this.client.send('scans.findOne', { id }));
  }

  update(id: string, dto: any) {
    return firstValueFrom(this.client.send('scans.update', { id, dto }));
  }

  getStats() {
    return firstValueFrom(this.client.send('scans.getStats', {}));
  }

  remove(id: string) {
    return firstValueFrom(this.client.send('scans.remove', { id }));
  }
}