// GET /api/email-status - Check email config (no secrets exposed)
// Helps debug "email fails to send" issues
import { NextResponse } from 'next/server';

export async function GET() {
  const resend = !!process.env.RESEND_API_KEY;
  const resendFrom = !!process.env.RESEND_FROM_EMAIL;
  const smtpHost = !!process.env.SMTP_HOST;
  const smtpUser = !!process.env.SMTP_USER;
  const smtpPass = !!process.env.SMTP_PASSWORD;

  let status: 'ok' | 'partial' | 'missing';
  let message: string;

  if (resend) {
    if (resendFrom) {
      status = 'ok';
      message = 'Resend configured. Emails should send.';
    } else {
      status = 'partial';
      message = 'RESEND_API_KEY set but RESEND_FROM_EMAIL missing. Add RESEND_FROM_EMAIL (e.g. FuturenTrepeneurship <noreply@quietshelter.org>)';
    }
  } else if (smtpHost && smtpUser && smtpPass) {
    status = 'ok';
    message = 'SMTP configured. Emails should send.';
  } else {
    status = 'missing';
    const parts = [];
    if (!smtpHost) parts.push('SMTP_HOST');
    if (!smtpUser) parts.push('SMTP_USER');
    if (!smtpPass) parts.push('SMTP_PASSWORD');
    message = `Email not configured. Add Resend (RESEND_API_KEY + RESEND_FROM_EMAIL) or SMTP (${parts.join(', ')}) to .env.local`;
  }

  return NextResponse.json({
    status,
    message,
    provider: resend ? 'resend' : smtpHost ? 'smtp' : 'none',
    hints: [
      'Resend: Sign up at resend.com, verify domain, get API key',
      'Gmail SMTP: Use App Password, not regular password',
      'See .env.example for required variables',
    ],
  });
}
