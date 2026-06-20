import { Resend } from 'resend';

export type EmailResult = { success: true } | { success: false; error: string };

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables');
  }
  return new Resend(apiKey);
}

function getFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not configured in environment variables');
  }
  return from;
}

export async function sendPasswordResetOtp(email: string, otp: string, name: string): Promise<void> {
  const resend = getClient();
  const from = getFromEmail();

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Your iCARE++ password reset code',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #0f172a;">
        <h2 style="color: #0d7377; margin-bottom: 16px;">Password reset request</h2>
        <p style="margin-bottom: 16px;">Hi ${name},</p>
        <p style="margin-bottom: 24px;">We received a request to reset your iCARE++ password. Use the code below to continue. It will expire in 10 minutes.</p>
        <div style="background: #f0f9fa; border: 1px solid #d0ebea; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 600; letter-spacing: 6px; color: #0d7377;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #64748b;">If you did not request this reset, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message);
  }
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
  try {
    const resend = getClient();
    const from = getFromEmail();

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: 'Welcome to iCARE++ – Your Account Has Been Created',
      html: buildWelcomeHtml(name, loginUrl),
    });

    if (error) {
      console.error('Resend error sending invitation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to send invitation email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
