import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
const ws = require('ws');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
      queue: 'catalog_queue',
      queueOptions: { durable: true },
    },
  });

  await app.listen();
  console.log('Catalog microservice running');
}

bootstrap();