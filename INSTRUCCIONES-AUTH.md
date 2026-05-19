# Auth conectada en todo el proyecto

## 1. Configurar credenciales de Supabase (OBLIGATORIO)

### Frontend
Edita `frontend/.env.local` y rellena:
```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```
(Las claves están en https://supabase.com/dashboard/project/_/settings/api)

### API Gateway
Copia `Api-gateway/.env.example` a `Api-gateway/.env` y rellena `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `DATABASE_URL`.

## 2. Base de datos
Ejecuta `supabase-migration.sql` en el SQL Editor de Supabase. Crea la tabla `profiles` y un trigger que la rellena automáticamente al registrarse un usuario.

## 3. Qué ya está conectado

- **middleware.ts**: protege todas las rutas. Si no hay sesión → redirige a `/login`. Ya NO crashea si faltan las env vars (muestra warning).
- **`/login` y `/register`**: usan Supabase Auth.
- **`useUser()` hook** (`frontend/hooks/use-user.ts`): disponible en cualquier componente cliente.
- **Dashboard**: muestra el email del usuario y un botón "Cerrar sesión" en el header.
- **API client** (`frontend/lib/api/client.ts`): envía `Authorization: Bearer <token>` en todas las llamadas.
- **API Gateway**: TODOS los controllers (`productos`, `ideas`, `scans`, `recommendations`, `feedback`, `catalog`) están protegidos con `@UseGuards(SupabaseAuthGuard)`. Las requests sin token válido reciben 401.
- `req.user` queda disponible dentro de cada controller protegido (id, email, etc.) para filtrar por usuario en los services si lo necesitas.

## 4. Levantar
```
cd frontend && npm install && npm run dev
cd Api-gateway && npm install && npm run start:dev
```
