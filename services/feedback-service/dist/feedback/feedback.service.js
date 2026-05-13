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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedbackService = class FeedbackService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return this.prisma.client;
    }
    async create(dto) {
        const { data, error } = await this.db.from('ideas').insert({
            titulo: `Feedback ${dto.rating}/5`,
            descripcion: dto.comment ?? `Rating: ${dto.rating}`,
            categoria: 'feedback',
            producto_id: dto.resultId,
        }).select('*').single();
        if (error)
            throw new Error(error.message);
        return { ...data, resultId: dto.resultId, rating: dto.rating, comment: dto.comment };
    }
    async findAll(minRating, resultId) {
        let q = this.db.from('ideas').select('*').eq('categoria', 'feedback')
            .order('created_at', { ascending: false });
        if (resultId)
            q = q.eq('producto_id', resultId);
        const { data, error } = await q;
        if (error)
            throw new Error(error.message);
        const rows = (data ?? []).map((r) => ({
            ...r,
            resultId: r.producto_id,
            rating: parseInt(r.titulo?.match(/\d+/)?.[0] ?? '3'),
            comment: r.descripcion,
        }));
        const filtered = minRating ? rows.filter((r) => r.rating >= minRating) : rows;
        const avg = filtered.length
            ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
            : 0;
        return {
            data: filtered,
            stats: { total: filtered.length, avgRating: Math.round(avg * 10) / 10 },
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map