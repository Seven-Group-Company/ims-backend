import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const email = (req as Request & { user?: any }).user?.email;
    if (!email) {
      return null;
    }
    return this.authService.getMe(email);
  }

    @Post('refresh')
  async refresh(@Req() req: Request) {
    // You may want to get the refresh token from cookies or body
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }
}