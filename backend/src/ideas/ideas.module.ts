import { Module } from '@nestjs/common';
import { IdeasController } from './ideas.controller';
import { IdeasService }    from './ideas.service';
import { PrismaModule }    from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IdeasController],
  providers: [IdeasService],
})
export class IdeasModule {}
