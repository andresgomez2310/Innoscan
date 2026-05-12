"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanEventsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const scan_events_constants_1 = require("./scan-events.constants");
let ScanEventsListener = class ScanEventsListener {
    constructor() {
        this.logger = new common_1.Logger('Observer');
    }
    onScanCreated(scan) {
        this.logger.log(`📡 Scan creado: "${scan.itemName}" [${scan.id}]`);
    }
    onRecsPartial(p) {
        this.logger.log(`⚙  [Parcial] scan ${p.scanId} → ${p.progress}% — ${p.message}`);
    }
    onRecsComplete(p) {
        this.logger.log(`✅ [Completo] resultado ${p.resultId} | estrategia: ${p.strategyName} | confianza: ${p.confidence}%`);
    }
    onFeedbackSubmitted(p) {
        this.logger.log(`★  Feedback ${p.rating}/5 → resultado ${p.resultId}`);
    }
};
exports.ScanEventsListener = ScanEventsListener;
__decorate([
    (0, event_emitter_1.OnEvent)(scan_events_constants_1.SCAN_EVENTS.SCAN_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScanEventsListener.prototype, "onScanCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(scan_events_constants_1.SCAN_EVENTS.RECS_PARTIAL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScanEventsListener.prototype, "onRecsPartial", null);
__decorate([
    (0, event_emitter_1.OnEvent)(scan_events_constants_1.SCAN_EVENTS.RECS_COMPLETE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScanEventsListener.prototype, "onRecsComplete", null);
__decorate([
    (0, event_emitter_1.OnEvent)(scan_events_constants_1.SCAN_EVENTS.FEEDBACK_SUBMITTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScanEventsListener.prototype, "onFeedbackSubmitted", null);
exports.ScanEventsListener = ScanEventsListener = __decorate([
    (0, common_1.Injectable)()
], ScanEventsListener);
//# sourceMappingURL=scan-events.listener.js.map