"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const ws = require('ws');
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
            queue: 'catalog_queue',
            queueOptions: { durable: true },
        },
    });
    await app.listen();
    console.log('Catalog microservice running');
}
bootstrap();
//# sourceMappingURL=main.js.map