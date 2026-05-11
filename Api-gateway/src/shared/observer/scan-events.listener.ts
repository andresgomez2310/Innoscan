// ══════════════════════════════════════════════════════════════
// PATRÓN OBSERVER — Suscriptores (Observers)
// Cada @OnEvent es un observer independiente.
// Se pueden agregar más sin tocar el emisor.
// ══════════════════════════════════════════════════════════════
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SCAN_EVENTS, RecsPartialPayload, RecsCompletePayload, FeedbackPayload } from './scan-events.constants';

@Injectable()
export class ScanEventsListener {
  private readonly logger = new Logger('Observer');

  @OnEvent(SCAN_EVENTS.SCAN_CREATED)
  onScanCreated(scan: { id: string; itemName: string }) {
    this.logger.log(`📡 Scan creado: "${scan.itemName}" [${scan.id}]`);
  }

  @OnEvent(SCAN_EVENTS.RECS_PARTIAL)
  onRecsPartial(p: RecsPartialPayload) {
    this.logger.log(`⚙  [Parcial] scan ${p.scanId} → ${p.progress}% — ${p.message}`);
  }

  @OnEvent(SCAN_EVENTS.RECS_COMPLETE)
  onRecsComplete(p: RecsCompletePayload) {
    this.logger.log(`✅ [Completo] resultado ${p.resultId} | estrategia: ${p.strategyName} | confianza: ${p.confidence}%`);
  }

  @OnEvent(SCAN_EVENTS.FEEDBACK_SUBMITTED)
  onFeedbackSubmitted(p: FeedbackPayload) {
    this.logger.log(`★  Feedback ${p.rating}/5 → resultado ${p.resultId}`);
  }
}
