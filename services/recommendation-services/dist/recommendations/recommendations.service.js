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
exports.RecommendationsService = exports.GenerateRecommendationsDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../prisma/prisma.service");
const flyweight_service_1 = require("../shared/flyweight/flyweight.service");
const scan_events_service_1 = require("../shared/observer/scan-events.service");
const recommendation_result_builder_1 = require("./builder/recommendation-result.builder");
const strategy_factory_1 = require("./strategies/strategy.factory");
class GenerateRecommendationsDto {
}
exports.GenerateRecommendationsDto = GenerateRecommendationsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateRecommendationsDto.prototype, "scanId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateRecommendationsDto.prototype, "transformationTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateRecommendationsDto.prototype, "itemName", void 0);
let RecommendationsService = class RecommendationsService {
    constructor(prisma, flyweight, events) {
        this.prisma = prisma;
        this.flyweight = flyweight;
        this.events = events;
    }
    async generate(dto) {
        const scan = await this.prisma.scan.findUnique({ where: { id: dto.scanId } });
        if (!scan)
            throw new common_1.NotFoundException(`Scan "${dto.scanId}" no encontrado`);
        const tType = await this.flyweight.getTransformationTypeById(dto.transformationTypeId);
        if (!tType)
            throw new common_1.BadRequestException('TransformationType inválido');
        this.events.notifyRecsPartial({ scanId: dto.scanId, progress: 25, message: `Analizando "${scan.itemName}"...` });
        const strategy = strategy_factory_1.StrategyFactory.create(tType.strategyKey);
        const items = strategy.generate(dto.itemName ?? scan.itemName, scan.condition);
        this.events.notifyRecsPartial({ scanId: dto.scanId, progress: 70, message: `Estrategia "${strategy.name}" aplicada...` });
        const built = new recommendation_result_builder_1.RecommendationResultBuilder()
            .withScanId(dto.scanId)
            .withTransformationTypeId(tType.id)
            .withStrategyName(strategy.name)
            .withRecommendations(items)
            .build();
        const saved = await this.prisma.recommendationResult.create({
            data: {
                scanId: built.scanId,
                strategyName: built.strategyName,
                recommendations: built.recommendations,
            },
            include: {
                scan: { include: { category: true } },
            }
        });
        await this.prisma.scan.update({ where: { id: dto.scanId }, data: { status: 'PROCESSED' } });
        return saved;
    }
    async findAll(transformationTypeId, scanId) {
        return this.prisma.recommendationResult.findMany({
            where: {
                ...(scanId && { scanId }),
            },
            include: {
                scan: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const r = await this.prisma.recommendationResult.findUnique({
            where: { id },
            include: {
                scan: { include: { category: true } },
            }
        });
        if (!r)
            throw new common_1.NotFoundException(`Resultado "${id}" no encontrado`);
        return r;
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        flyweight_service_1.FlyweightService,
        scan_events_service_1.ScanEventsService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map