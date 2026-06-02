# Auth conectada en todo el proyecto:

1. Configurar credenciales de Supabase
Frontend
La carpeta frontend contiene los archivos .tsx que conforman las interfaces de usuario.

API Gateway
Se encarga de la comunicación con RabbitMQ y los microservicios.

2. Base de datos
Ejecuta supabase-migration.sql en el SQL Editor de Supabase. Este script crea la tabla profiles y un trigger que la rellena automáticamente cuando un usuario se registra.

3. Lo qué está conectado:
middleware.ts: protege todas las rutas. Si no hay sesión activa, redirige a /login. Ya no falla si faltan las variables de entorno (muestra un aviso en su lugar).
/login y /register: autenticación mediante Supabase Auth.
Hook useUser() (frontend/hooks/use-user.ts): disponible en cualquier componente cliente.
Dashboard: muestra el email del usuario y un botón para cerrar sesión en el header.
Cliente API (frontend/lib/api/client.ts): adjunta automáticamente el header Authorization: Bearer <token> en todas las peticiones.
API Gateway: todos los controllers (productos, ideas, scans, recommendations, feedback, catalog) están protegidos con @UseGuards(SupabaseAuthGuard). Las peticiones sin token válido reciben un 401.
req.user queda disponible dentro de cada controller protegido (con id, email, etc.) para filtrar por usuario en los servicios si es necesario.


4. Levantar el proyecto
# Frontend
cd frontend && npm install && npm run dev

# API Gateway
cd Api-gateway && npm install && npm run start:dev
o con Docker:
bash#
docker-compose up