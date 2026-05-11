import { Module } from '@nestjs/common'

import { RecommendationsService } from './recommendations.service'
import { RecommendationsController } from './recommendations.controller'

import { PrismaModule } from '../prisma/prisma.module'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [
    PrismaModule,
    SharedModule,
  ],

  controllers: [RecommendationsController],

  providers: [RecommendationsService],
})
export class RecommendationsModule {}