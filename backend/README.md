# InnoScan Backend — NestJS + Prisma + PostgreSQL

## Patrones implementados
| Patrón | Archivo | Descripción |
|--------|---------|-------------|
| 🏗 Builder   | `src/recommendations/builder/recommendation-result.builder.ts` | Construye RecommendationResult paso a paso |
| 🪶 Flyweight | `src/shared/flyweight/flyweight.service.ts` | Cachea categorías, tipos y etiquetas en memoria |
| ⚡ Strategy  | `src/recommendations/strategies/` | 3 algoritmos intercambiables de recomendación |
| 👁 Observer  | `src/shared/observer/` | Notifica eventos parciales y completos |

## Endpoints (10)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | /api/v1/categories | Lista categorías (Flyweight) |
| GET    | /api/v1/transformation-types | Lista tipos (Flyweight) |
| GET    | /api/v1/flyweight/stats | Estado del cache |
| POST   | /api/v1/scans | Crear scan |
| GET    | /api/v1/scans | Listar scans paginado |
| GET    | /api/v1/scans/stats | Estadísticas |
| GET    | /api/v1/scans/:id | Obtener scan |
| POST   | /api/v1/recommendations/generate | Generar (Builder+Strategy+Observer) |
| GET    | /api/v1/recommendations | Listar resultados |
| POST   | /api/v1/feedback | Crear feedback |

## Correr en local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env (copiar .env.example y rellenar DATABASE_URL)
cp .env.example .env

# 3. Generar cliente Prisma
npm run db:generate

# 4. Correr migraciones
npm run db:migrate

# 5. Cargar datos iniciales (categorías y tipos)
npm run db:seed

# 6. Iniciar servidor
npm run start:dev
# → http://localhost:3001/api/v1
```

## Desplegar en Railway

1. Crear cuenta en railway.app
2. New Project → Deploy from GitHub repo → seleccionar este repo
3. Agregar variables de entorno:
   - `DATABASE_URL` = Connection string de Supabase
   - `FRONTEND_URL` = URL de Vercel
   - `PORT` = 3001
4. Railway usa `nixpacks.toml` — corre migraciones y seed automáticamente
