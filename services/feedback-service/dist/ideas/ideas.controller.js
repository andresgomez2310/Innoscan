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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const ideas_service_1 = require("./ideas.service");
const create_idea_dto_1 = require("./dto/create-idea.dto");
let IdeasController = class IdeasController {
    constructor(service) {
        this.service = service;
    }
    findAll(payload) {
        return this.service.findAll(payload?.estado);
    }
    create(dto) {
        return this.service.create(dto);
    }
    updateEstado(payload) {
        return this.service.updateEstado(payload.id, payload.estado);
    }
    remove(payload) {
        return this.service.remove(payload.id);
    }
};
exports.IdeasController = IdeasController;
__decorate([
    (0, microservices_1.MessagePattern)('ideas.findAll'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)('ideas.create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_idea_dto_1.CreateIdeaDto]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)('ideas.updateEstado'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "updateEstado", null);
__decorate([
    (0, microservices_1.MessagePattern)('ideas.remove'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "remove", null);
exports.IdeasController = IdeasController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [ideas_service_1.IdeasService])
], IdeasController);
//# sourceMappingURL=ideas.controller.js.map