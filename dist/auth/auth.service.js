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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const company_entity_1 = require("../entities/company.entity");
const role_entity_1 = require("../entities/role.entity");
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const common_2 = require("@nestjs/common");
const email_service_1 = require("./email.service");
let AuthService = AuthService_1 = class AuthService {
    usersRepository;
    companyRepository;
    roleRepository;
    jwtService;
    emailService;
    logger = new common_2.Logger(AuthService_1.name);
    constructor(usersRepository, companyRepository, roleRepository, jwtService, emailService) {
        this.usersRepository = usersRepository;
        this.companyRepository = companyRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async register(createUserDto) {
        try {
            this.logger.log('Registering user:', createUserDto.email);
            const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
            if (existingUser) {
                this.logger.warn('Email already registered:', createUserDto.email);
                throw new common_1.ConflictException('Email already registered');
            }
            const existingCompany = await this.companyRepository.findOne({ where: { name: createUserDto.company } });
            if (existingCompany) {
                this.logger.warn('Company name already exists:', createUserDto.company);
                throw new common_1.ConflictException('Company name already exists');
            }
            const company = await this.createCompany(createUserDto.company);
            this.logger.log('Created company:', company);
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = this.usersRepository.create({
                email: createUserDto.email,
                password: hashedPassword,
                fullName: createUserDto.fullName,
                company,
                roles: await this.assignInitialRoles(),
            });
            this.logger.log('Created user entity:', user);
            await this.usersRepository.save(user);
            this.logger.log('Saved user:', user.email);
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.usersRepository.update(user.id, {
                verificationToken,
                verificationTokenExpiry,
            });
            this.logger.log('Set verification token for:', user.email);
            await this.emailService.sendVerificationEmail(user, verificationToken);
            this.logger.log('Sent verification email to:', user.email);
            return this.generateToken(user);
        }
        catch (error) {
            this.logger.error('Registration error:', error);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Registration failed');
        }
    }
    async verifyEmail(token) {
        this.logger.log(`Verification attempt for token: ${token}`);
        const user = await this.usersRepository.findOne({
            where: { verificationToken: token },
        });
        if (!user) {
            this.logger.warn(`Invalid verification token: ${token}`);
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (user.verificationTokenExpiry < new Date()) {
            this.logger.warn(`Expired verification token: ${token}`);
            throw new common_1.BadRequestException('Verification link has expired');
        }
        await this.usersRepository.update(user.id, {
            isVerified: true,
            verificationToken: undefined,
            verificationTokenExpiry: undefined,
        });
        this.logger.log(`Email verified for user: ${user.email}`);
        return { message: 'Email verified successfully' };
    }
    async resendVerificationEmail(email) {
        this.logger.log(`Resend verification requested for: ${email}`);
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.warn(`Resend attempt for non-existent email: ${email}`);
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            this.logger.warn(`Resend attempt for verified email: ${email}`);
            throw new common_1.BadRequestException('Email already verified');
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.usersRepository.update(user.id, {
            verificationToken,
            verificationTokenExpiry,
        });
        await this.emailService.sendVerificationEmail(user, verificationToken);
    }
    async login(email, password) {
        try {
            const user = await this.usersRepository.findOne({
                where: { email },
                relations: ['roles', 'roles.permissions', 'company'],
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            return {
                accessToken: this.generateToken(user).accessToken,
                user,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Login failed');
        }
    }
    async getMe(email) {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['roles', 'roles.permissions', 'company'],
        });
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
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('No refresh token provided');
        }
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET });
            const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const newPayload = { sub: user.id, email: user.email, roles: user.roles.map(r => r.name) };
            const accessToken = this.jwtService.sign(newPayload);
            return { accessToken };
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map