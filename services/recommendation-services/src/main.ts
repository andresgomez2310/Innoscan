import * as dotenv from 'dotenv'

dotenv.config()

console.log(
  'SUPABASE URL =',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)

import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'

async function bootstrap() {

  const app = await NestFactory.createMicroservice(
    AppModule,
    {
      transport: Transport.RMQ,

      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],

        queue: 'recommendations_queue',

        queueOptions: {
          durable: true,
        },
      },
    },
  )

  await app.listen()

  console.log('Recommendation microservice running')
}

bootstrap()