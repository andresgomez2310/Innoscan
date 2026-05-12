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
exports.FlyweightService = exports.EFFORT_LABELS = exports.CONDITION_TAGS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.CONDITION_TAGS = ['nuevo', 'bueno', 'regular', 'dañado', 'antiguo', 'raro'];
exports.EFFORT_LABELS = {
    bajo: '🟢 Bajo',
    medio: '🟡 Medio',
    alto: '🔴 Alto',
};
let FlyweightService = class FlyweightService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('Flyweight');
        this.categories = null;
        this.transformationTypes = null;
    }
    async onModuleInit() {
        await Promise.all([this.getCategories(), this.getTransformationTypes()]);
        this.logger.log(`Cache listo — ${this.categories.length} categorías, ` +
            `${this.transformationTypes.length} tipos, ` +
            `${exports.CONDITION_TAGS.length} etiquetas estáticas`);
    }
    async getCategories() {
        if (!this.categories)
            this.categories = await this.prisma.category.findMany({ orderBy: { label: 'asc' } });
        return this.categories;
    }
    async getCategoryById(id) {
        return (await this.getCategories()).find(c => c.id === id);
    }
    async getTransformationTypes() {
        if (!this.transformationTypes)
            this.transformationTypes = await this.prisma.transformationType.findMany();
        return this.transformationTypes;
    }
    async getTransformationTypeById(id) {
        return (await this.getTransformationTypes()).find(t => t.id === id);
    }
    getConditionTags() { return exports.CONDITION_TAGS; }
    getEffortLabels() { return exports.EFFORT_LABELS; }
    invalidateCache() {
        this.categories = null;
        this.transformationTypes = null;
        this.logger.warn('Cache invalidado');
    }
    getCacheStats() {
        return {
            categories: { cached: !!this.categories, count: this.categories?.length ?? 0 },
            transformationTypes: { cached: !!this.transformationTypes, count: this.transformationTypes?.length ?? 0 },
            conditionTags: { cached: true, count: exports.CONDITION_TAGS.length },
            effortLabels: { cached: true, count: Object.keys(exports.EFFORT_LABELS).length },
        };
    }
};
exports.FlyweightService = FlyweightService;
exports.FlyweightService = FlyweightService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlyweightService);
//# sourceMappingURL=flyweight.service.js.map