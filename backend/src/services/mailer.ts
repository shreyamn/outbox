import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;
let etherealUser = '';
let etherealPreviewBase = '';

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (env.ETHEREAL_USER && env.ETHEREAL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: env.ETHEREAL_USER, pass: env.ETHEREAL_PASS },
    });
    etherealUser = env.ETHEREAL_USER;
    etherealPreviewBase = 'https://ethereal.email/message/';
    console.log(`✅ Using existing Ethereal account: ${etherealUser}`);
  } else {
    const account = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
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

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<string> {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"ReachInbox" <${etherealUser}>`,
    to: opts.toName ? `"${opts.toName}" <${opts.to}>` : opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`📧 Email sent to ${opts.to} — preview: ${previewUrl}`);
  return info.messageId as string;
}
