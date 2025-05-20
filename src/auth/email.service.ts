import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'verification',
      context: {
        name: user.fullName,
        verificationUrl,
      },
    });
  }
}