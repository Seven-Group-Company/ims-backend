export declare class SendGridService {
    private readonly logger;
    constructor();
    sendVerificationEmail(email: string, templateData: any): Promise<void>;
}
