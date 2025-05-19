// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { SeederService } from './database/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Company, Role, Permission],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Role, Permission]), // Add this line
    AuthModule,
  ],
  providers: [SeederService],
})
export class AppModule {}