import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

let verified = false;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new Error(
        'SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS must be configured in environment variables',
      );
    }

    const portNumber = Number(port);
    if (Number.isNaN(portNumber)) {
      throw new Error('SMTP_PORT must be a valid number');
    }

    transporter = nodemailer.createTransport({
      host,
      port: portNumber,
      secure: process.env.SMTP_SECURE === 'true' || portNumber === 465,
      auth: {
        user,
        pass,
      },
    });

    // Verify the connection on first use so auth errors surface early.
    transporter.verify((err) => {
      verified = true;
      if (err) {
        console.error('[SMTP] Connection verification failed:', err.message);
      } else {
        console.log('[SMTP] Connection verified successfully');
      }
    });
  }
  return transporter;
}

function getFromEmail(): string {
  const from = process.env.SMTP_FROM_EMAIL;
  if (!from) {
    throw new Error('SMTP_FROM_EMAIL is not configured in environment variables');
  }
  return from;
}

function getFromName(): string {
  return process.env.SMTP_FROM_NAME || 'iCARE++';
}

function shouldSkipSendInDev(): boolean {
  // In development we skip SMTP unless explicitly asked to send.
  // Set SMTP_SEND_IN_DEV=true in .env.local to test real email delivery.
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.SMTP_SEND_IN_DEV !== 'true'
  );
}

export type EmailResult = { success: true } | { success: false; error: string };

export interface EmailSendResult {
  skipped: boolean;
  otp?: string;
}

async function sendOtpEmail(
  email: string,
  otp: string,
  name: string,
  subject: string,
  heading: string,
  bodyText: string,
  devLabel: string,
): Promise<EmailSendResult> {
  if (shouldSkipSendInDev()) {
    console.log(`[DEV] ${devLabel} OTP for ${email}: ${otp}`);
    return { skipped: true, otp };
  }

  const transport = getTransporter();
  const fromEmail = getFromEmail();
  const fromName = getFromName();

  try {
    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${name}" <${email}>`,
      subject,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #0f172a;">
          <h2 style="color: #0d7377; margin-bottom: 16px;">${heading}</h2>
          <p style="margin-bottom: 16px;">Hi ${name},</p>
          <p style="margin-bottom: 24px;">${bodyText}</p>
          <div style="background: #f0f9fa; border: 1px solid #d0ebea; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 600; letter-spacing: 6px; color: #0d7377;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[SMTP] ${devLabel} email sent to ${email}:`, info.messageId);
  } catch (err) {
    console.error('SMTP error:', err);
    const message = err instanceof Error ? err.message : 'Failed to send email';
    throw new Error(message);
  }

  return { skipped: false };
}

export async function sendPasswordResetOtp(
  email: string,
  otp: string,
  name: string,
): Promise<EmailSendResult> {
  return sendOtpEmail(
    email,
    otp,
    name,
    'Your iCARE++ password reset code',
    'Password reset request',
    'We received a request to reset your iCARE++ password. Use the code below to continue. It will expire in 10 minutes.',
    'Password reset',
  );
}

export async function sendPasswordChangeOtp(
  email: string,
  otp: string,
  name: string,
): Promise<EmailSendResult> {
  return sendOtpEmail(
    email,
    otp,
    name,
    'Confirm your iCARE++ password change',
    'Confirm password change',
    'We received a request to change the password for your iCARE++ account. Use the code below to confirm this change. It will expire in 10 minutes.',
    'Password change',
  );
}

function buildWelcomeHtml(name: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#0D7377,#0A5C5F);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">iCARE++</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#b8e2e4;">Clinical Competency Assessment Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:600;">Welcome, ${name}!</h2>
              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
                A faculty member has created an account for you on <strong>iCARE++</strong> — a scalable,
                ML-driven clinical competency assessment and adaptive learning system for nursing students.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                You can now sign in to access your quizzes, scenarios, and track your performance.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#0D7377,#0A5C5F);">
                    <a href="${loginUrl}" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
                      Sign In to iCARE++
                    </a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                <tr>
                  <td style="font-size:13px;color:#64748b;line-height:1.5;">
                    <strong style="color:#0f172a;">Getting started:</strong><br/>
                    &bull; Complete assigned quizzes and scenarios<br/>
                    &bull; Track your progress and competency scores<br/>
                    &bull; Review personalized insights and recommendations
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#94a3b8;">
                If you believe this account was created in error, please contact your faculty administrator.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} iCARE++. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendStudentInvitationEmail(
  email: string,
  name: string,
  loginUrl: string,
): Promise<EmailResult> {
  if (shouldSkipSendInDev()) {
    console.log(`[DEV] Student invitation email for ${email}: ${loginUrl}`);
    return { success: true };
  }

  const transport = getTransporter();
  const fromEmail = getFromEmail();
  const fromName = getFromName();

  try {
    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${name}" <${email}>`,
      subject: 'Welcome to iCARE++ – Your Account Has Been Created',
      html: buildWelcomeHtml(name, loginUrl),
    });
    console.log(`[SMTP] Invitation email sent to ${email}:`, info.messageId);
    return { success: true };
  } catch (err) {
    console.error('SMTP error sending invitation:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
