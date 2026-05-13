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
exports.IdeasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IdeasService = class IdeasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return this.prisma.client;
    }
    async findAll(estado) {
        let q = this.db.from('ideas').select('*, productos(nombre)').order('created_at', { ascending: false });
        if (estado)
            q = q.eq('estado', estado);
        const { data, error } = await q;
        if (error)
            throw new Error(error.message);
        return data ?? [];
    }
    async create(dto) {
        const { data, error } = await this.db.from('ideas').insert({
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            producto_id: dto.producto_id ?? null,
            categoria: dto.categoria ?? null,
            estado: dto.estado ?? 'activa',
        }).select('*, productos(nombre)').single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async updateEstado(id, estado) {
        const { data, error } = await this.db.from('ideas').update({ estado }).eq('id', id).select('*').single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async remove(id) {
        const { error } = await this.db.from('ideas').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
        return { deleted: true, id };
    }
};
exports.IdeasService = IdeasService;
exports.IdeasService = IdeasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdeasService);
//# sourceMappingURL=ideas.service.js.map