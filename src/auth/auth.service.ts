// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
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

async login(email: string, password: string): Promise<{ accessToken: string, user: User }> {
  const user = await this.usersRepository.findOne({
    where: { email },
    relations: ['roles', 'roles.permissions', 'company'],
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return {
    accessToken: this.generateToken(user).accessToken,
    user,
  };
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