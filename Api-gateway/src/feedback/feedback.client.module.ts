import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FeedbackClientService } from './feedback.client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FEEDBACK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'feedback_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [FeedbackClientService],
  exports: [FeedbackClientService],
})
export class FeedbackClientModule {}