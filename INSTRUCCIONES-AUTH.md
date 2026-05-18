# Auth añadida — Instrucciones

## 1. Frontend
1. Copia `frontend/.env.local.example` a `frontend/.env.local` y rellena con tus claves de Supabase.
2. Las dependencias ya están en `package.json` (`@supabase/ssr`, `@supabase/supabase-js`). Solo corre `npm install`.
3. Listo: `/login` y `/register` ya funcionan. `middleware.ts` protege el resto.
4. Para mostrar el botón de logout, importa en `components/dashboard.tsx`:
   ```tsx
   import { LogoutButton } from "@/components/logout-button"
   // ...y úsalo en el header: <LogoutButton />
   ```

## 2. API Gateway
1. Copia `Api-gateway/.env.example` a `Api-gateway/.env` y rellena.
2. Añade `AuthModule` en `src/app.module.ts`:
   ```ts
   import { AuthModule } from './auth/auth.module';
   // ...en imports: AuthModule,
   ```
3. Para proteger un controller:
   ```ts
   import { UseGuards } from '@nestjs/common';
   import { SupabaseAuthGuard } from '../auth/auth.guard';

   @UseGuards(SupabaseAuthGuard)
   @Controller('productos')
   export class ProductosController { ... }
   ```

## 3. Base de datos
Ejecuta `supabase-migration.sql` en el SQL Editor de Supabase (crea tabla `profiles` + trigger).

## 4. Enviar token desde el frontend
Actualiza `frontend/lib/api/client.ts` para añadir el token Bearer en cada request (helper de ejemplo):
```ts
import { createClient } from "@/lib/supabase/client"

async function getAuthHeader() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}
```
Y úsalo dentro de `request()` antes del fetch.
