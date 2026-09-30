"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransporter = getTransporter;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
let transporter = null;
let etherealUser = '';
let etherealPreviewBase = '';
async function getTransporter() {
    if (transporter)
        return transporter;
    if (env_1.env.ETHEREAL_USER && env_1.env.ETHEREAL_PASS) {
        transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user: env_1.env.ETHEREAL_USER, pass: env_1.env.ETHEREAL_PASS },
        });
        etherealUser = env_1.env.ETHEREAL_USER;
        etherealPreviewBase = 'https://ethereal.email/message/';
        console.log(`✅ Using existing Ethereal account: ${etherealUser}`);
    }
    else {
        const account = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user: account.user, pass: account.pass },
        });
        etherealUser = account.user;
        etherealPreviewBase = 'https://ethereal.email/message/';
        console.log(`✅ Ethereal test account created: ${etherealUser}`);
        console.log('   Set ETHEREAL_USER and ETHEREAL_PASS to reuse across restarts');
    }
    return transporter;
}
async function sendEmail(opts) {
    const t = await getTransporter();
    const info = await t.sendMail({
        from: `"ReachInbox" <${etherealUser}>`,
        to: opts.toName ? `"${opts.toName}" <${opts.to}>` : opts.to,
        subject: opts.subject,
        html: opts.html,
    });
    const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
    console.log(`📧 Email sent to ${opts.to} — preview: ${previewUrl}`);
    return info.messageId;
}
//# sourceMappingURL=mailer.js.map