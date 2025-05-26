"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SendGridService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridService = void 0;
const common_1 = require("@nestjs/common");
const sgMail = require("@sendgrid/mail");
let SendGridService = SendGridService_1 = class SendGridService {
    logger = new common_1.Logger(SendGridService_1.name);
    constructor() {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SENDGRID_API_KEY environment variable is not set');
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
    async sendVerificationEmail(email, templateData) {
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
        }
        catch (error) {
            this.logger.error(`Error sending email to ${email}: ${error.message}`);
            throw new Error('Failed to send verification email');
        }
    }
};
exports.SendGridService = SendGridService;
exports.SendGridService = SendGridService = SendGridService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SendGridService);
//# sourceMappingURL=sendgrid.service.js.map