import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ScansModule } from './scans/scans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    SharedModule,
    RecommendationsModule,
    ScansModule,
  ],
})
export class AppModule {}