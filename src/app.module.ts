// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { SeederService } from './database/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Mailer module config
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT ?? '587', 10),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Company, Role, Permission],
      synchronize: true,
    }),

    TypeOrmModule.forFeature([Role, Permission]),
    AuthModule,
  ],
  providers: [SeederService],
})
export class AppModule {}
