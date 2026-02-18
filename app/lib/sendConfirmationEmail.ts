// lib/sendConfirmationEmail.ts
// Shared logic for sending payment confirmation emails - used by webhook (primary) and API route (admin fallback)
// Supports Resend (recommended) or SMTP/nodemailer
import nodemailer from 'nodemailer';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ConfirmationEmailParams {
  email: string;
  fullName: string;
  uniqueId: string;
  categoryName: string;
  categoryId: string;
  price: string;
}

const PITCH_DECK_ELIGIBLE = ['fully-funded', 'partially-funded'];

function getHtmlAndText(params: ConfirmationEmailParams): { html: string; text: string } {
  const { email, fullName, uniqueId, categoryName, categoryId, price } = params;
  const includePitchDeck = categoryId && PITCH_DECK_ELIGIBLE.includes(String(categoryId));
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quietshelter.org';
  const pitchDeckUrl = `${baseUrl}/pitchdeck?id=${encodeURIComponent(uniqueId)}&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&category=${encodeURIComponent(categoryName)}`;

  const pitchDeckSection = includePitchDeck ? `
    <div class="next-steps">
      <h3>🚀 What's Next?</h3>
      <ul>
        <li><strong>Submit Your Pitch Deck:</strong> Click the button below to submit your business pitch deck using your Registration ID</li>
        <li><strong>Payment Confirmed:</strong> Your registration fee (${price}) has been successfully processed</li>
        <li><strong>Stay Connected:</strong> Check your email regularly for important program announcements</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${pitchDeckUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white !important; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold;">📊 Submit Your Pitch Deck Now →</a>
    </div>
    <div class="warning"><p><strong>⏰ Important:</strong> Submit your pitch deck to be eligible for the business plan competition and funding opportunities!</p></div>
    <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 12px;"><p style="margin: 0; word-break: break-all;">${pitchDeckUrl}</p></div>
  ` : `
    <div class="next-steps" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b;">
      <h3>✅ Registration Confirmed</h3>
      <p><strong>You are registered for: ${categoryName}</strong></p>
      <p>Your payment of ${price} has been successfully processed. You now have full access to your program benefits.</p>
      <p><strong>What's next:</strong> Training schedule and access details will be sent to your email. Your mentor will contact you after March 9, 2026.</p>
    </div>
  `;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f3f4f6}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:linear-gradient(135deg,#059669 0%,#0d9488 100%);color:white;padding:30px;text-align:center}
.content{padding:30px}
.success-badge{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;padding:20px;border-radius:12px;text-align:center;margin:25px 0}
.registration-id{background:#f0fdfa;border:2px solid #14b8a6;border-radius:12px;padding:25px;margin:25px 0;text-align:center}
.registration-id-value{font-size:28px;font-weight:bold;color:#059669}
.details{background:#f9fafb;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #e5e7eb}
.details-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}
.next-steps{background:#eff6ff;border-left:4px solid #3b82f6;padding:20px;margin:25px 0;border-radius:0 8px 8px 0}
.warning{background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0}
.footer{text-align:center;padding:25px;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;background:#f9fafb}
</style>
</head>
<body>
<div class="container">
  <div class="header"><h1>🎉 Payment Confirmed!</h1><p>FuturenTrepeneurship NYSC 2026</p></div>
  <div class="content">
    <div class="success-badge"><h2>✅ Registration Successfully Completed</h2><p>Your payment has been processed and your spot is secured!</p></div>
    <p>Dear <strong>${fullName}</strong>,</p>
    <p>Congratulations! Your payment for the <strong>FuturenTrepeneurship Program</strong> has been successfully processed.</p>
    <div class="registration-id">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase">YOUR REGISTRATION ID</div>
      <div class="registration-id-value">${uniqueId}</div>
      <p style="font-size:14px;color:#059669;margin:10px 0 0 0">${includePitchDeck ? 'Keep this ID — you need it to submit your pitch deck' : 'Keep this ID safe for your records'}</p>
    </div>
    <div class="details">
      <h3>📋 Payment Summary</h3>
      <div class="details-row"><span>Name:</span><span>${fullName}</span></div>
      <div class="details-row"><span>Email:</span><span>${email}</span></div>
      <div class="details-row"><span>Category:</span><span><strong>${categoryName}</strong></span></div>
      <div class="details-row"><span>Amount Paid:</span><span><strong>${price}</strong></span></div>
      <div class="details-row"><span>Status:</span><span style="color:#059669;font-weight:bold">✅ PAID</span></div>
    </div>
    ${pitchDeckSection}
    <p style="margin-top:30px">Questions? Contact <strong>support@quietshelter.org</strong></p>
    <p style="margin-top:25px">Best regards,<br><strong>The FuturenTrepeneurship Team</strong></p>
  </div>
  <div class="footer"><p>© 2026 Quiet Shelter Empowerment Foundation</p></div>
</div>
</body>
</html>`;

  const textContent = `
Payment Confirmed - FuturenTrepeneurship NYSC 2026

Dear ${fullName},

✅ REGISTRATION COMPLETED
Your payment has been processed. Your category: ${categoryName}
Amount: ${price}

REGISTRATION ID: ${uniqueId}

${includePitchDeck ? `Submit your pitch deck: ${pitchDeckUrl}` : `You're all set. Training details will be sent to your email.`}

Contact: support@quietshelter.org
`;

  return { html: htmlContent, text: textContent };
}

export async function sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
  const { email, fullName, uniqueId, categoryName } = params;

  if (!email || !fullName || !uniqueId || !categoryName || !params.price) {
    throw new Error('Missing required fields for confirmation email');
  }

  const subject = `✅ Payment Confirmed - ${uniqueId} | FuturenTrepeneurship NYSC 2026`;
  const { html, text } = getHtmlAndText(params);

  // Option 1: Resend (recommended - simpler, reliable in serverless)
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;

  if (resendKey) {
    if (!fromEmail) {
      throw new Error('RESEND_FROM_EMAIL or SMTP_FROM_EMAIL required when using Resend (e.g. FuturenTrepeneurship <noreply@quietshelter.org>)');
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.message || err?.error || await res.text();
      throw new Error(`Resend failed: ${msg || res.statusText}`);
    }
    await updateEmailSent(uniqueId);
    return;
  }

  // Option 2: SMTP / Nodemailer
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      'Email not configured. Add either RESEND_API_KEY + RESEND_FROM_EMAIL, or SMTP_HOST, SMTP_USER, SMTP_PASSWORD to your .env'
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: `"FuturenTrepeneurship" <${process.env.SMTP_FROM_EMAIL || smtpUser}>`,
      to: email,
      subject,
      html,
      text,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`SMTP failed: ${msg}`);
  }

  await updateEmailSent(uniqueId);
}

async function updateEmailSent(uniqueId: string): Promise<void> {
  try {
    const docRef = doc(db, 'registrations', uniqueId);
    await updateDoc(docRef, {
      emailSent: true,
      emailSentAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (e) {
    console.warn('Could not update emailSent in Firestore:', e);
  }
}
