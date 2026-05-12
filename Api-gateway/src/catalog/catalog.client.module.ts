import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CatalogClientService } from './catalog.client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'catalog_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [CatalogClientService],
  exports: [CatalogClientService],
})
export class CatalogClientModule {}