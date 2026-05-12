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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CatalogService = class CatalogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return this.prisma.client;
    }
    async findAll(search, categoria) {
        let q = this.db.from('productos').select('*').order('created_at', { ascending: false });
        if (search)
            q = q.ilike('nombre', `%${search}%`);
        if (categoria)
            q = q.eq('categoria', categoria);
        const { data, error } = await q;
        if (error)
            throw new Error(error.message);
        return data ?? [];
    }
    async getCategories() {
        const { data, error } = await this.db.from('productos').select('*').order('nombre');
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((p) => ({ id: p.id, label: p.nombre, ...p }));
    }
    async create(dto) {
        const { data, error } = await this.db.from('productos').insert({
            nombre: dto.nombre,
            categoria: dto.categoria ?? null,
            descripcion: dto.descripcion ?? null,
            codigo_barras: dto.codigo_barras ?? null,
        }).select('*').single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async remove(id) {
        const { error } = await this.db.from('productos').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
        return { deleted: true, id };
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map