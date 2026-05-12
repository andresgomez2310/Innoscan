import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaModule } from './prisma/prisma.module'
import { RecommendationsModule } from './recommendations/recommendations.module'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    RecommendationsModule,
  ],
})
export class AppModule {}