// ══════════════════════════════════════════════════════════════
// PATRÓN OBSERVER — Emisor (Subject)
// Emite eventos del dominio sin saber quién los escucha.
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SCAN_EVENTS, RecsPartialPayload, RecsCompletePayload, FeedbackPayload } from './scan-events.constants';

@Injectable()
export class ScanEventsService {
  constructor(private readonly emitter: EventEmitter2) {}

  notifyScanCreated(scan: { id: string; itemName: string }) {
    this.emitter.emit(SCAN_EVENTS.SCAN_CREATED, scan);
  }

  // Notifica resultado PARCIAL mientras el proceso avanza
  notifyRecsPartial(payload: RecsPartialPayload) {
    this.emitter.emit(SCAN_EVENTS.RECS_PARTIAL, payload);
  }

  // Notifica resultado COMPLETO cuando Builder.build() fue exitoso
  notifyRecsComplete(payload: RecsCompletePayload) {
    this.emitter.emit(SCAN_EVENTS.RECS_COMPLETE, payload);
  }

  notifyFeedbackSubmitted(payload: FeedbackPayload) {
    this.emitter.emit(SCAN_EVENTS.FEEDBACK_SUBMITTED, payload);
  }
}
