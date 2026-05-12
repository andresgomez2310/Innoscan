import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecsPartialPayload, RecsCompletePayload, FeedbackPayload } from './scan-events.constants';
export declare class ScanEventsService {
    private readonly emitter;
    constructor(emitter: EventEmitter2);
    notifyScanCreated(scan: {
        id: string;
        itemName: string;
    }): void;
    notifyRecsPartial(payload: RecsPartialPayload): void;
    notifyRecsComplete(payload: RecsCompletePayload): void;
    notifyFeedbackSubmitted(payload: FeedbackPayload): void;
}
