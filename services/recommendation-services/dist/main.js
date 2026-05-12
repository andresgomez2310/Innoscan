"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
console.log('SUPABASE URL =', process.env.NEXT_PUBLIC_SUPABASE_URL);
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: ['amqp://guest:guest@127.0.0.1:5672'],
            queue: 'recommendations_queue',
            queueOptions: {
                durable: true,
            },
        },
    });
    await app.listen();
    console.log('Recommendation microservice running');
}
bootstrap();
//# sourceMappingURL=main.js.map