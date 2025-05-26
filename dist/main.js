"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dotenv = require("dotenv");
const winston_config_1 = require("./logger/winston.config");
const http_exception_filter_1 = require("./filters/http-exception.filter");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: winston_config_1.winstonConfig,
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 1000);
}
bootstrap();
//# sourceMappingURL=main.js.map