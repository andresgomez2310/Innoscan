import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PrismaService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.client = createClient(url, key);
  }

  get scan()                 { return new ScanTable(this.client); }
  get category()             { return new CategoryTable(this.client); }
  get transformationType()   { return new TransformationTypeTable(this.client); }
  get recommendationResult() { return new RecommendationResultTable(this.client); }
  get feedback()             { return new FeedbackTable(this.client); }
}

class ScanTable {
  constructor(private db: SupabaseClient) {}

  async create({ data }: any) {
    const insert = {
      producto_id: data.categoryId,
      notas:       data.description ?? data.itemName,
      ubicacion:   data.condition,
    };
    const { data: row, error } = await this.db
      .from('escaneos').insert(insert).select('*, category:productos(*)').single();
    if (error) throw new Error(error.message);
    return this.mapScan(row);
  }

  async findMany({ skip = 0, take = 20 }: any = {}) {
    const { data, error } = await this.db
      .from('escaneos').select('*, category:productos(*)')
      .order('created_at', { ascending: false }).range(skip, skip + take - 1);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => this.mapScan(r));
  }

  async findUnique({ where }: any) {
    const { data, error } = await this.db
      .from('escaneos').select('*, category:productos(*), results:recomendaciones(*)')
      .eq('id', where.id).single();
    if (error) return null;
    return this.mapScan(data);
  }

  async count() {
    const { count, error } = await this.db.from('escaneos').select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async update({ where, data }: any) {
    const update: any = {};
    if (data.condition)   update.ubicacion = data.condition;
    if (data.description) update.notas     = data.description;
    const { data: row, error } = await this.db
      .from('escaneos').update(update).eq('id', where.id)
      .select('*, category:productos(*)').single();
    if (error) throw new Error(error.message);
    return this.mapScan(row);
  }

  async groupBy(_args: any) {
    const { data, error } = await this.db.from('escaneos').select('ubicacion');
    if (error) throw new Error(error.message);
    const groups: Record<string, number> = {};
    for (const row of data ?? []) {
      const key = row.ubicacion ?? 'PENDING';
      groups[key] = (groups[key] ?? 0) + 1;
    }
    return Object.entries(groups).map(([status, count]) => ({ status, _count: { _all: count } }));
  }

  private mapScan(row: any) {
    if (!row) return null;
    return {
      ...row,
      itemName:   row.notas ?? '',
      categoryId: row.producto_id,
      condition:  row.ubicacion ?? 'bueno',
      status:     'PENDING',
      createdAt:  row.created_at,
    };
  }
}

class CategoryTable {
  constructor(private db: SupabaseClient) {}

  async findMany(_args: any = {}) {
    const { data, error } = await this.db.from('productos').select('*').order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => ({ id: p.id, label: p.nombre, ...p }));
  }
}

class TransformationTypeTable {
  private static readonly types = [
    { id: '1', label: 'Reutilizar',   strategyKey: 'reuseStrategy'       },
    { id: '2', label: 'Transformar',  strategyKey: 'transformStrategy'   },
    { id: '3', label: 'Reconfigurar', strategyKey: 'reconfigureStrategy' },
  ];
  constructor(private db: SupabaseClient) {}
  async findMany() { return TransformationTypeTable.types; }
}

class RecommendationResultTable {
  constructor(private db: SupabaseClient) {}

  async create({ data }: any) {
    const insert = {
      producto_id:        data.scanId,
      producto_nombre:    data.scanId,
      condicion:          'bueno',
      estrategia_key:     data.transformationTypeId,
      estrategia_nombre:  data.strategyName ?? '',
      recomendaciones:    data.recommendations,
      confianza_promedio: data.confidence,
      procesado_en_ms:    data.processingTimeMs,
      estado:             data.status ?? 'COMPLETO',
    };
    const { data: row, error } = await this.db
      .from('recomendaciones').insert(insert).select('*').single();
    if (error) throw new Error(error.message);
    return this.mapResult(row);
  }

  async findMany({ where }: any = {}) {
    let q = this.db.from('recomendaciones').select('*');
    if (where?.scanId) q = q.eq('producto_id', where.scanId);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => this.mapResult(r));
  }

  async findUnique({ where }: any) {
    const { data, error } = await this.db
      .from('recomendaciones').select('*').eq('id', where.id).single();
    if (error) return null;
    return this.mapResult(data);
  }

  private mapResult(row: any) {
    if (!row) return null;
    return {
      ...row,
      scanId:               row.producto_id,
      transformationTypeId: row.estrategia_key,
      recommendations:      row.recomendaciones,
      confidence:           row.confianza_promedio,
      processingTimeMs:     row.procesado_en_ms,
      status:               row.estado,
      createdAt:            row.created_at,
      transformationType:   { id: row.estrategia_key, strategyKey: row.estrategia_key, label: row.estrategia_nombre },
      scan:                 null,
      feedback:             [],
    };
  }
}

class FeedbackTable {
  constructor(private db: SupabaseClient) {}

  async create({ data }: any) {
    const insert = {
      titulo:      `Feedback ${data.rating}/5`,
      descripcion: data.comment ?? `Rating: ${data.rating}`,
      categoria:   'feedback',
      producto_id: data.resultId,
    };
    const { data: row, error } = await this.db.from('ideas').insert(insert).select('*').single();
    if (error) throw new Error(error.message);
    return { ...row, resultId: data.resultId, rating: data.rating, comment: data.comment };
  }

  async findMany({ where }: any = {}) {
    let q = this.db.from('ideas').select('*').eq('categoria', 'feedback');
    if (where?.resultId) q = q.eq('producto_id', where.resultId);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      ...r,
      resultId: r.producto_id,
      rating:   parseInt(r.titulo?.match(/\d+/)?.[0] ?? '3'),
      comment:  r.descripcion,
    }));
  }

  async aggregate({ where }: any) {
    const rows = await this.findMany({ where });
    const avg = rows.length ? rows.reduce((s: number, r: any) => s + r.rating, 0) / rows.length : 0;
    return { _avg: { rating: avg }, _count: { _all: rows.length } };
  }
}
