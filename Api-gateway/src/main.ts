import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule }      from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Limite de payload aumentado para imágenes grandes
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');

  const server = app.getHttpAdapter();
  server.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok' });
  });

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0'); 
  
  console.log(`🚀 InnoScan API corriendo en el puerto ${port}`);
  console.log(`🌍 Prefijo global: /api/v1`);
}
bootstrap();