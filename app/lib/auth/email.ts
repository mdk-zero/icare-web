import { Resend } from 'resend';

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
