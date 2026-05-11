import { Global, Module }     from '@nestjs/common';
import { FlyweightService }   from './flyweight/flyweight.service';
import { ScanEventsService }  from './observer/scan-events.service';
import { ScanEventsListener } from './observer/scan-events.listener';
import { PrismaModule } from '../prisma/prisma.module'

@Global()
@Module({
  imports: [PrismaModule],
  providers: [FlyweightService, ScanEventsService, ScanEventsListener],
  exports:   [FlyweightService, ScanEventsService],
})
export class SharedModule {}
