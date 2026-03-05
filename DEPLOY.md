# Guía de Despliegue — ScanRec

## Stack
- Frontend → Vercel
- Backend  → Railway
- DB       → Supabase (PostgreSQL)

---

## PASO 1: Supabase (Base de datos)

1. Ir a https://supabase.com → New project → nombre: `scanrec`
2. Anotar la contraseña que eliges
3. Esperar ~2 minutos a que cree
4. Ir a Settings → Database → Connection string → URI
5. Copiar la URL (se ve así):
   postgresql://postgres:[PASSWORD]@db.XXXX.supabase.co:5432/postgres

---

## PASO 2: Subir código a GitHub

```bash
git init
git add .
git commit -m "feat: ScanRec inicial"
git remote add origin https://github.com/TU-USUARIO/scanrec.git
git push -u origin main
```

---

## PASO 3: Railway (Backend NestJS)

1. Ir a https://railway.app → New Project → Deploy from GitHub repo
2. Seleccionar tu repo → elegir la carpeta `backend`
3. En Variables agregar:

   DATABASE_URL  = postgresql://postgres:[PASSWORD]@db.XXXX.supabase.co:5432/postgres
   FRONTEND_URL  = https://scanrec.vercel.app   ← poner URL de Vercel después
   PORT          = 3000

4. En Settings → Build Command:
   npm install && npm run db:generate && npm run build

5. En Settings → Start Command:
   npx prisma migrate deploy && npx prisma db seed && npm run start:prod

6. Copiar la URL que Railway asigna, ej:
   https://scanrec-backend-production.up.railway.app

---

## PASO 4: Vercel (Frontend React)

1. Ir a https://vercel.com → New Project → importar repo de GitHub
2. Elegir carpeta raíz: `frontend`
3. Framework: Vite
4. En Environment Variables agregar:

   VITE_API_URL = https://scanrec-backend-production.up.railway.app

5. Deploy

6. Copiar la URL de Vercel → volver a Railway → actualizar FRONTEND_URL con esa URL

---

## PASO 5: Redeploy Railway con FRONTEND_URL actualizado

En Railway → Variables → cambiar FRONTEND_URL por la URL real de Vercel → Redeploy

---

## URLs finales
- Frontend: https://scanrec.vercel.app
- Backend:  https://scanrec-backend-production.up.railway.app/api/v1
- Health:   https://scanrec-backend-production.up.railway.app/health

