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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const recommendations_service_1 = require("./recommendations.service");
let RecommendationsController = class RecommendationsController {
    constructor(service) {
        this.service = service;
    }
    generate(dto) {
        return this.service.generate(dto);
    }
    findAll(typeId, scanId) {
        return this.service.findAll(typeId, scanId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommendations_service_1.GenerateRecommendationsDto]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('transformationTypeId')),
    __param(1, (0, common_1.Query)('scanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "findOne", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, common_1.Controller)('recommendations'),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map