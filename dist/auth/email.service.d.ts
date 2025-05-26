import { User } from '../entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
export declare class EmailService {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    sendVerificationEmail(user: User, token: string): Promise<void>;
}
