# Innoscan — Motor de Recomendaciones por Escaneo

## Correr en local

### 1. Backend
```bash
cd backend
cp .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev           # corre en http://localhost:3001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # corre en http://localhost:3000
```

---

## Publicado en internet con Vercel

Fue publicado en Vercel + Usando la base de datos Supabase

---

## Patrones implementados
| Patrón | Archivo |
|--------|---------|
| 🏗 Builder   | `backend/src/recommendations/builder/recommendation-result.builder.ts` |
| 🪶 Flyweight | `backend/src/shared/flyweight/flyweight.service.ts` |
| ⚡ Strategy  | `backend/src/recommendations/strategies/` |
| 👁 Observer  | `backend/src/shared/observer/` |
