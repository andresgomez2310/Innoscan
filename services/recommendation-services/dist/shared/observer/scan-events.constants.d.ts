export declare const SCAN_EVENTS: {
    readonly SCAN_CREATED: "scan.created";
    readonly RECS_PARTIAL: "recommendations.partial";
    readonly RECS_COMPLETE: "recommendations.complete";
    readonly FEEDBACK_SUBMITTED: "feedback.submitted";
};
export interface RecsPartialPayload {
    scanId: string;
    progress: number;
    message: string;
}
export interface RecsCompletePayload {
    resultId: string;
    scanId: string;
    strategyName: string;
    confidence: number;
}
export interface FeedbackPayload {
    resultId: string;
    rating: number;
}
