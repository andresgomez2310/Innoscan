import { Module } from '@nestjs/common'

import { ScansService } from './scans.service'
import { ScansController } from './scans.controller'

import { PrismaModule } from '../prisma/prisma.module'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [
    PrismaModule,
    SharedModule,
  ],

  controllers: [ScansController],

  providers: [ScansService],
})
export class ScansModule {}