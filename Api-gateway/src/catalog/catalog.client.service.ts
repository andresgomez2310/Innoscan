import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CatalogClientService {
  constructor(@Inject('CATALOG_SERVICE') private readonly client: ClientProxy) {}

  findAll(search?: string, categoria?: string) {
    return firstValueFrom(this.client.send('catalog.findAll', { search, categoria }));
  }

  getCategories() {
    return firstValueFrom(this.client.send('catalog.getCategories', {}));
  }

  create(dto: any) {
    return firstValueFrom(this.client.send('catalog.create', dto));
  }

  remove(id: string) {
    return firstValueFrom(this.client.send('catalog.remove', { id }));
  }
}