// src/auth/sendgrid.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);

  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendVerificationEmail(email: string, templateData: any): Promise<void> {
    const from = process.env.SENDGRID_FROM_EMAIL;
    const templateId = process.env.SENDGRID_VERIFICATION_TEMPLATE_ID;

    if (!from) {
      throw new Error('SENDGRID_FROM_EMAIL environment variable is not set');
    }
    if (!templateId) {
      throw new Error('SENDGRID_VERIFICATION_TEMPLATE_ID environment variable is not set');
    }

    const msg = {
      to: email,
      from,
      templateId,
      dynamic_template_data: templateData,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${email}: ${error.message}`);
      throw new Error('Failed to send verification email');
    }
  }
}