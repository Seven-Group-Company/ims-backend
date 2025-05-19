"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const user_entity_1 = require("./entities/user.entity");
const company_entity_1 = require("./entities/company.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const seeder_service_1 = require("./database/seeder.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [user_entity_1.User, company_entity_1.Company, role_entity_1.Role, permission_entity_1.Permission],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([role_entity_1.Role, permission_entity_1.Permission]),
            auth_module_1.AuthModule,
        ],
        providers: [seeder_service_1.SeederService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map