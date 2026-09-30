import nodemailer from 'nodemailer';
export declare function getTransporter(): Promise<nodemailer.Transporter>;
export interface SendEmailOptions {
    to: string;
    toName?: string;
    subject: string;
    html: string;
}
export declare function sendEmail(opts: SendEmailOptions): Promise<string>;
//# sourceMappingURL=mailer.d.ts.map