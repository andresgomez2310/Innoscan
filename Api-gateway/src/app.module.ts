import { Module }             from '@nestjs/common';
import { ConfigModule }       from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule }          from './prisma/prisma.module';
import { SharedModule }          from './shared/shared.module';
import { CatalogModule }         from './catalog/catalog.module';
import { ScansModule }           from './scans/scans.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { FeedbackModule }        from './feedback/feedback.module';
import { ProductosModule }       from './productos/productos.module';
import { IdeasModule }           from './ideas/ideas.module';
import { AuthModule }            from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    EventEmitterModule.forRoot(),
    PrismaModule,
    SharedModule,
    AuthModule,
    CatalogModule,
    ScansModule,
    RecommendationsModule,
    FeedbackModule,
    ProductosModule,
    IdeasModule,
  ],
})
export class AppModule {}
