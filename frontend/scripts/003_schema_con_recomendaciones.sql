-- ══════════════════════════════════════════════════════════════
-- InnoScan — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- Limpiar tablas anteriores si existen
DROP TABLE IF EXISTS public.recomendaciones CASCADE;
DROP TABLE IF EXISTS public.ideas CASCADE;
DROP TABLE IF EXISTS public.escaneos CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;

-- ── Tabla de Productos ────────────────────────────────────────
CREATE TABLE public.productos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  descripcion   TEXT,
  categoria     TEXT,
  codigo_barras TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla de Escaneos ─────────────────────────────────────────
CREATE TABLE public.escaneos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  ubicacion   TEXT,
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla de Ideas ────────────────────────────────────────────
CREATE TABLE public.ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria   TEXT,
  estado      TEXT DEFAULT 'borrador',
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  escaneo_id  UUID REFERENCES public.escaneos(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla de Recomendaciones (Builder construye cada fila) ────
-- Aquí se almacenan los resultados que el Builder ensambla.
-- Cada fila representa un RecomendacionResultado completo.
CREATE TABLE public.recomendaciones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id        UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  producto_nombre    TEXT NOT NULL,
  condicion          TEXT NOT NULL,
  estrategia_key     TEXT NOT NULL,   -- reutilizar | transformar | reconfigurar
  estrategia_nombre  TEXT NOT NULL,
  recomendaciones    JSONB NOT NULL,  -- [{ titulo, confianza, esfuerzo }]
  confianza_promedio INT  NOT NULL,
  procesado_en_ms    INT,
  estado             TEXT DEFAULT 'COMPLETO',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS: acceso público (sin auth) ───────────────────────────
ALTER TABLE public.productos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escaneos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recomendaciones ENABLE ROW LEVEL SECURITY;

-- Productos
CREATE POLICY "productos_all" ON public.productos FOR ALL USING (true) WITH CHECK (true);
-- Escaneos
CREATE POLICY "escaneos_all"  ON public.escaneos  FOR ALL USING (true) WITH CHECK (true);
-- Ideas
CREATE POLICY "ideas_all"     ON public.ideas     FOR ALL USING (true) WITH CHECK (true);
-- Recomendaciones
CREATE POLICY "recs_all"      ON public.recomendaciones FOR ALL USING (true) WITH CHECK (true);
