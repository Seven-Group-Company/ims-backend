import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AuthService {
    private usersRepository;
    private companyRepository;
    private roleRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, companyRepository: Repository<Company>, roleRepository: Repository<Role>, jwtService: JwtService);
    register(createUserDto: CreateUserDto): Promise<{
        accessToken: string;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: User;
    }>;
    getMe(email: string): Promise<User | null>;
    private createCompany;
    private assignInitialRoles;
    private generateToken;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
