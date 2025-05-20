import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { 
  ConflictException,
  Injectable, 
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    try {
      // Check if email already exists
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: createUserDto.email } 
      });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Check if company name already exists
      const existingCompany = await this.companyRepository.findOne({
        where: { name: createUserDto.company }
      });
      if (existingCompany) {
        throw new ConflictException('Company name already exists');
      }

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

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.usersRepository.update(user.id, {
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user, verificationToken);

      return this.generateToken(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

    async verifyEmail(token: string) {
    this.logger.log(`Verification attempt for token: ${token}`);
    
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      this.logger.warn(`Invalid verification token: ${token}`);
      throw new BadRequestException('Invalid verification token');
    }

    if (user.verificationTokenExpiry < new Date()) {
      this.logger.warn(`Expired verification token: ${token}`);
      throw new BadRequestException('Verification link has expired');
    }

    await this.usersRepository.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
      verificationTokenExpiry: undefined,
    });

    this.logger.log(`Email verified for user: ${user.email}`);
    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    this.logger.log(`Resend verification requested for: ${email}`);
    
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      this.logger.warn(`Resend attempt for non-existent email: ${email}`);
      throw new NotFoundException('User not found');
    }
    
    if (user.isVerified) {
      this.logger.warn(`Resend attempt for verified email: ${email}`);
      throw new BadRequestException('Email already verified');
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersRepository.update(user.id, {
      verificationToken,
      verificationTokenExpiry,
    });

    await this.emailService.sendVerificationEmail(user, verificationToken);
  }

  async login(email: string, password: string): Promise<{ accessToken: string, user: User }> {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
        relations: ['roles', 'roles.permissions', 'company'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        accessToken: this.generateToken(user).accessToken,
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException('Login failed');
    }
  }

  async getMe(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions', 'company'],
    });
  }

  private async createCompany(name: string): Promise<Company> {
    return this.companyRepository.save({ name });
  }

  private async assignInitialRoles(): Promise<Role[]> {
    const defaultRole = await this.roleRepository.findOne({ 
      where: { name: 'Admin' },
      relations: ['permissions']
    });
    
    if (!defaultRole) {
      // If no roles exist, create a basic user role
      const userRole = this.roleRepository.create({
        name: 'User',
        permissions: []
      });
      return [await this.roleRepository.save(userRole)];
    }
    
    return [defaultRole];
  }

  private generateToken(user: User): { accessToken: string } {
    const payload = { 
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
      permissions: user.roles.flatMap(role => 
        role.permissions.map(permission => permission.name)
      )
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    // Validate the refresh token (implement your logic here)
    // For example, verify JWT and find user
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET });
      // Optionally, check if the token is in a whitelist or not expired
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      // Issue a new access token
      const newPayload = { sub: user.id, email: user.email, roles: user.roles.map(r => r.name) };
      const accessToken = this.jwtService.sign(newPayload);
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}