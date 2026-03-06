import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule }      from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  // Health check para Railway
  const server = app.getHttpAdapter();
  server.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 InnoScan API corriendo en http://localhost:${port}/api/v1`);
}
bootstrap();
