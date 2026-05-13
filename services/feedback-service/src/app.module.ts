import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { FeedbackModule } from './feedback/feedback.module';
import { IdeasModule } from './ideas/ideas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FeedbackModule,
    IdeasModule,
  ],
})
export class AppModule {}