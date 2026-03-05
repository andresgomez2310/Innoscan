-- Tabla de Usuarios (profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  imagen_url TEXT,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Escaneos
CREATE TABLE IF NOT EXISTS public.escaneos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  resultado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Ideas
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT,
  escaneo_id UUID REFERENCES public.escaneos(id) ON DELETE SET NULL,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escaneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios
CREATE POLICY "usuarios_select_own" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON public.usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_update_own" ON public.usuarios FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for productos
CREATE POLICY "productos_select_own" ON public.productos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "productos_insert_own" ON public.productos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "productos_update_own" ON public.productos FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "productos_delete_own" ON public.productos FOR DELETE USING (auth.uid() = usuario_id);

-- RLS Policies for escaneos
CREATE POLICY "escaneos_select_own" ON public.escaneos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "escaneos_insert_own" ON public.escaneos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "escaneos_delete_own" ON public.escaneos FOR DELETE USING (auth.uid() = usuario_id);

-- RLS Policies for ideas
CREATE POLICY "ideas_select_own" ON public.ideas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "ideas_insert_own" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "ideas_update_own" ON public.ideas FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "ideas_delete_own" ON public.ideas FOR DELETE USING (auth.uid() = usuario_id);

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nombre', 'Usuario'),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
