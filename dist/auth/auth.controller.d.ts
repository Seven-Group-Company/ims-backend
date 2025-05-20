import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
    }>;
    getMe(req: Request & {
        user: any;
    }): Promise<import("../entities/user.entity").User | null>;
}
