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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let PrismaService = class PrismaService {
    constructor() {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const ws = require('ws');
        this.client = (0, supabase_js_1.createClient)(url, key, {
            realtime: {
                transport: ws,
            },
        });
    }
    get scan() { return new ScanTable(this.client); }
    get category() { return new CategoryTable(this.client); }
    get transformationType() { return new TransformationTypeTable(this.client); }
    get recommendationResult() { return new RecommendationResultTable(this.client); }
    get feedback() { return new FeedbackTable(this.client); }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
class ScanTable {
    constructor(db) {
        this.db = db;
    }
    async create({ data }) {
        const insert = {
            producto_id: data.categoryId,
            notas: data.description ?? data.itemName,
            ubicacion: data.condition,
        };
        const { data: row, error } = await this.db
            .from('escaneos').insert(insert).select('*, category:productos(*)').single();
        if (error)
            throw new Error(error.message);
        return this.mapScan(row);
    }
    async findMany({ skip = 0, take = 20 } = {}) {
        const { data, error } = await this.db
            .from('escaneos').select('*, category:productos(*)')
            .order('created_at', { ascending: false }).range(skip, skip + take - 1);
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((r) => this.mapScan(r));
    }
    async findUnique({ where }) {
        const { data, error } = await this.db
            .from('escaneos').select('*, category:productos(*), results:recomendaciones(*)')
            .eq('id', where.id).single();
        if (error)
            return null;
        return this.mapScan(data);
    }
    async count() {
        const { count, error } = await this.db.from('escaneos').select('*', { count: 'exact', head: true });
        if (error)
            throw new Error(error.message);
        return count ?? 0;
    }
    async update({ where, data }) {
        const update = {};
        if (data.condition)
            update.ubicacion = data.condition;
        if (data.description)
            update.notas = data.description;
        const { data: row, error } = await this.db
            .from('escaneos').update(update).eq('id', where.id)
            .select('*, category:productos(*)').single();
        if (error)
            throw new Error(error.message);
        return this.mapScan(row);
    }
    async groupBy(_args) {
        const { data, error } = await this.db.from('escaneos').select('ubicacion');
        if (error)
            throw new Error(error.message);
        const groups = {};
        for (const row of data ?? []) {
            const key = row.ubicacion ?? 'PENDING';
            groups[key] = (groups[key] ?? 0) + 1;
        }
        return Object.entries(groups).map(([status, count]) => ({ status, _count: { _all: count } }));
    }
    mapScan(row) {
        if (!row)
            return null;
        return {
            ...row,
            itemName: row.notas ?? '',
            categoryId: row.producto_id,
            condition: row.ubicacion ?? 'bueno',
            status: 'PENDING',
            createdAt: row.created_at,
        };
    }
}
class CategoryTable {
    constructor(db) {
        this.db = db;
    }
    async findMany(_args = {}) {
        const { data, error } = await this.db.from('productos').select('*').order('nombre');
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((p) => ({ id: p.id, label: p.nombre, ...p }));
    }
}
class TransformationTypeTable {
    constructor(db) {
        this.db = db;
    }
    async findMany() { return TransformationTypeTable.types; }
}
TransformationTypeTable.types = [
    { id: '1', label: 'Reutilizar', strategyKey: 'reuseStrategy' },
    { id: '2', label: 'Transformar', strategyKey: 'transformStrategy' },
    { id: '3', label: 'Reconfigurar', strategyKey: 'reconfigureStrategy' },
];
class RecommendationResultTable {
    constructor(db) {
        this.db = db;
    }
    async create({ data }) {
        const insert = {
            producto_id: data.scanId,
            producto_nombre: data.scanId,
            condicion: 'bueno',
            estrategia_key: data.transformationTypeId,
            estrategia_nombre: data.strategyName ?? '',
            recomendaciones: data.recommendations,
            confianza_promedio: data.confidence,
            procesado_en_ms: data.processingTimeMs,
            estado: data.status ?? 'COMPLETO',
        };
        const { data: row, error } = await this.db
            .from('recomendaciones').insert(insert).select('*').single();
        if (error)
            throw new Error(error.message);
        return this.mapResult(row);
    }
    async findMany({ where } = {}) {
        let q = this.db.from('recomendaciones').select('*');
        if (where?.scanId)
            q = q.eq('producto_id', where.scanId);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((r) => this.mapResult(r));
    }
    async findUnique({ where }) {
        const { data, error } = await this.db
            .from('recomendaciones').select('*').eq('id', where.id).single();
        if (error)
            return null;
        return this.mapResult(data);
    }
    mapResult(row) {
        if (!row)
            return null;
        return {
            ...row,
            scanId: row.producto_id,
            transformationTypeId: row.estrategia_key,
            recommendations: row.recomendaciones,
            confidence: row.confianza_promedio,
            processingTimeMs: row.procesado_en_ms,
            status: row.estado,
            createdAt: row.created_at,
            transformationType: { id: row.estrategia_key, strategyKey: row.estrategia_key, label: row.estrategia_nombre },
            scan: null,
            feedback: [],
        };
    }
}
class FeedbackTable {
    constructor(db) {
        this.db = db;
    }
    async create({ data }) {
        const insert = {
            titulo: `Feedback ${data.rating}/5`,
            descripcion: data.comment ?? `Rating: ${data.rating}`,
            categoria: 'feedback',
            producto_id: data.resultId,
        };
        const { data: row, error } = await this.db.from('ideas').insert(insert).select('*').single();
        if (error)
            throw new Error(error.message);
        return { ...row, resultId: data.resultId, rating: data.rating, comment: data.comment };
    }
    async findMany({ where } = {}) {
        let q = this.db.from('ideas').select('*').eq('categoria', 'feedback');
        if (where?.resultId)
            q = q.eq('producto_id', where.resultId);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((r) => ({
            ...r,
            resultId: r.producto_id,
            rating: parseInt(r.titulo?.match(/\d+/)?.[0] ?? '3'),
            comment: r.descripcion,
        }));
    }
    async aggregate({ where }) {
        const rows = await this.findMany({ where });
        const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
        return { _avg: { rating: avg }, _count: { _all: rows.length } };
    }
}
//# sourceMappingURL=prisma.service.js.map