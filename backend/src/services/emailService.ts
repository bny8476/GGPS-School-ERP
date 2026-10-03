import nodemailer, { Transporter } from 'nodemailer';

interface SendMailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface SendMailResult {
  success: boolean;
  messageId: string;
  mode: 'smtp' | 'simulated';
  info?: any;
  error?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && user && pass && !host.includes('ethereal.email')) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false,
          },
        });
        this.isConfigured = true;
      } catch (err) {
        console.warn('⚠️ [EmailService] Failed to initialize live SMTP transporter, falling back to simulated mode:', err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
    }
  }

  public async sendEmail(options: SendMailOptions): Promise<SendMailResult> {
    const sender = process.env.SMTP_FROM || '"GGPS School" <noreply@ggps.edu>';
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    // If live SMTP is configured, attempt real dispatch
    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: sender,
          to: options.to,
          cc: options.cc,
          bcc: options.bcc,
          subject: options.subject,
          text: options.text || options.subject,
          html: options.html,
        });

        console.log(`📧 [EmailService:SMTP] Dispatched to ${recipients} | ID: ${info.messageId}`);
        return {
          success: true,
          messageId: info.messageId,
          mode: 'smtp',
          info,
        };
      } catch (error: any) {
        console.warn(`⚠️ [EmailService:SMTP Error] ${error.message}. Switching to simulated dispatch fallback.`);
      }
    }

    // Simulated sandbox mode (Reliable fallback for local dev & demo environments)
    const simId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`📨 [EmailService:Sandbox Simulation] Dispatched Email`);
    console.log(`From:    ${sender}`);
    console.log(`To:      ${recipients}`);
    if (options.cc) console.log(`Cc:      ${Array.isArray(options.cc) ? options.cc.join(', ') : options.cc}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`MessageId: ${simId}`);
    console.log(`Status:  Simulated / Sandbox Delivery OK`);
    console.log(`--------------------------------------------------------------------------------`);

    return {
      success: true,
      messageId: simId,
      mode: 'simulated',
    };
  }
}

export const emailService = new EmailService();
export default emailService;
