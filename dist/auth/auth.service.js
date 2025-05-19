"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const company_entity_1 = require("../entities/company.entity");
const role_entity_1 = require("../entities/role.entity");
let AuthService = class AuthService {
    usersRepository;
    companyRepository;
    roleRepository;
    jwtService;
    constructor(usersRepository, companyRepository, roleRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.companyRepository = companyRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }
    async register(createUserDto) {
        const company = await this.createCompany(createUserDto.company);
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            email: createUserDto.email,
            password: hashedPassword,
            fullName: createUserDto.fullName,
            company,
            roles: await this.assignInitialRoles(),
        });
        await this.usersRepository.save(user);
        return this.generateToken(user);
    }
    async createCompany(name) {
        return this.companyRepository.save({ name });
    }
    async assignInitialRoles() {
        const defaultRole = await this.roleRepository.findOne({
            where: { name: 'Admin' },
            relations: ['permissions']
        });
        if (!defaultRole) {
            const userRole = this.roleRepository.create({
                name: 'User',
                permissions: []
            });
            return [await this.roleRepository.save(userRole)];
        }
        return [defaultRole];
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map(role => role.name),
            permissions: user.roles.flatMap(role => role.permissions.map(permission => permission.name))
        };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map