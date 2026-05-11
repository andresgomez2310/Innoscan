// ══════════════════════════════════════════════════════════════
// PATRÓN OBSERVER — Constantes y payloads tipados
// ══════════════════════════════════════════════════════════════

export const SCAN_EVENTS = {
  SCAN_CREATED:       'scan.created',
  RECS_PARTIAL:       'recommendations.partial',  // resultado parcial en progreso
  RECS_COMPLETE:      'recommendations.complete', // resultado final listo
  FEEDBACK_SUBMITTED: 'feedback.submitted',
} as const;

export interface RecsPartialPayload  { scanId: string; progress: number; message: string; }
export interface RecsCompletePayload { resultId: string; scanId: string; strategyName: string; confidence: number; }
export interface FeedbackPayload     { resultId: string; rating: number; }
