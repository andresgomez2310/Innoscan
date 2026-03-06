import { Global, Module }     from '@nestjs/common';
import { FlyweightService }   from './flyweight/flyweight.service';
import { ScanEventsService }  from './observer/scan-events.service';
import { ScanEventsListener } from './observer/scan-events.listener';

@Global()
@Module({
  providers: [FlyweightService, ScanEventsService, ScanEventsListener],
  exports:   [FlyweightService, ScanEventsService],
})
export class SharedModule {}
