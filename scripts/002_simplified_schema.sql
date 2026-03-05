-- Drop existing tables to recreate with simplified schema
DROP TABLE IF EXISTS public.ideas CASCADE;
DROP TABLE IF EXISTS public.escaneos CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Tabla de Productos (simplified - no user auth required)
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  codigo_barras TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Escaneos
CREATE TABLE IF NOT EXISTS public.escaneos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  fecha_escaneo TIMESTAMPTZ DEFAULT NOW(),
  ubicacion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Ideas
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT,
  estado TEXT DEFAULT 'borrador',
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  escaneo_id UUID REFERENCES public.escaneos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security but allow public access
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escaneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Public access policies for productos
CREATE POLICY "productos_select_all" ON public.productos FOR SELECT USING (true);
CREATE POLICY "productos_insert_all" ON public.productos FOR INSERT WITH CHECK (true);
CREATE POLICY "productos_update_all" ON public.productos FOR UPDATE USING (true);
CREATE POLICY "productos_delete_all" ON public.productos FOR DELETE USING (true);

-- Public access policies for escaneos
CREATE POLICY "escaneos_select_all" ON public.escaneos FOR SELECT USING (true);
CREATE POLICY "escaneos_insert_all" ON public.escaneos FOR INSERT WITH CHECK (true);
CREATE POLICY "escaneos_update_all" ON public.escaneos FOR UPDATE USING (true);
CREATE POLICY "escaneos_delete_all" ON public.escaneos FOR DELETE USING (true);

-- Public access policies for ideas
CREATE POLICY "ideas_select_all" ON public.ideas FOR SELECT USING (true);
CREATE POLICY "ideas_insert_all" ON public.ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "ideas_update_all" ON public.ideas FOR UPDATE USING (true);
CREATE POLICY "ideas_delete_all" ON public.ideas FOR DELETE USING (true);
