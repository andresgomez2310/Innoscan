"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const flyweight_service_1 = require("./flyweight/flyweight.service");
const scan_events_service_1 = require("./observer/scan-events.service");
const scan_events_listener_1 = require("./observer/scan-events.listener");
const prisma_module_1 = require("../prisma/prisma.module");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [flyweight_service_1.FlyweightService, scan_events_service_1.ScanEventsService, scan_events_listener_1.ScanEventsListener],
        exports: [flyweight_service_1.FlyweightService, scan_events_service_1.ScanEventsService],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map