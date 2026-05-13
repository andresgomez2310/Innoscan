import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScansClientService } from './scans.client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RECOMMENDATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'recommendations_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [ScansClientService],
  exports: [ScansClientService],
})
export class ScansClientModule {}