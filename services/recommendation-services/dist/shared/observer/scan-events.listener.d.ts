import { RecsPartialPayload, RecsCompletePayload, FeedbackPayload } from './scan-events.constants';
export declare class ScanEventsListener {
    private readonly logger;
    onScanCreated(scan: {
        id: string;
        itemName: string;
    }): void;
    onRecsPartial(p: RecsPartialPayload): void;
    onRecsComplete(p: RecsCompletePayload): void;
    onFeedbackSubmitted(p: FeedbackPayload): void;
}
