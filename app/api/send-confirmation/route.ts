import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, uniqueId, categoryName, price } = await request.json();

    // Validate required fields
    if (!email || !fullName || !uniqueId || !categoryName || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create nodemailer transporter
    // Configure with your SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Build the pitch deck URL - use /pitchdeck route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quietshelter.org';
    const pitchDeckUrl = `${baseUrl}/pitchdeck?id=${encodeURIComponent(uniqueId)}&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&category=${encodeURIComponent(categoryName)}`;

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; font-size: 18px; opacity: 0.95; }
            .content { padding: 30px; }
            .registration-id { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
            .registration-id-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
            .registration-id-value { font-size: 36px; font-weight: bold; color: #059669; margin: 15px 0; font-family: 'Courier New', monospace; letter-spacing: 2px; }
            .id-note { margin: 10px 0 0 0; font-size: 14px; color: #059669; font-weight: 500; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e7eb; }
            .details h3 { margin-top: 0; color: #111827; font-size: 18px; }
            .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .details-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #374151; }
            .value { color: #6b7280; text-align: right; }
            .next-steps { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
            .next-steps h3 { margin-top: 0; color: #1e40af; font-size: 18px; }
            .next-steps ul { margin: 10px 0; padding-left: 20px; }
            .next-steps li { margin: 10px 0; color: #1f2937; }
            .next-steps strong { color: #1e40af; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white !important; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 25px 0; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.3s; }
            .button:hover { box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4); transform: translateY(-2px); }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .warning p { margin: 5px 0; color: #78350f; }
            .footer { text-align: center; padding: 25px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
            .footer p { margin: 5px 0; }
            .footer strong { color: #059669; }
            @media only screen and (max-width: 600px) {
              .content { padding: 20px; }
              .registration-id-value { font-size: 28px; }
              .details-row { flex-direction: column; }
              .value { text-align: left; margin-top: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
              <p>FuturenTrepeneurship NYSC 2026</p>
            </div>
            
            <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>
              
              <p>Congratulations! Your registration for the <strong>FuturenTrepeneurship Youth Empowerment & Development Program</strong> has been successfully confirmed.</p>
              
              <div class="registration-id">
                <div class="registration-id-label">YOUR REGISTRATION ID</div>
                <div class="registration-id-value">${uniqueId}</div>
                <p class="id-note">⚠️ Keep this ID safe - you'll need it for pitch deck submission</p>
              </div>
              
              <div class="details">
                <h3>📋 Registration Summary</h3>
                <div class="details-row">
                  <span class="label">Name:</span>
                  <span class="value">${fullName}</span>
                </div>
                <div class="details-row">
                  <span class="label">Email:</span>
                  <span class="value">${email}</span>
                </div>
                <div class="details-row">
                  <span class="label">Category:</span>
                  <span class="value">${categoryName}</span>
                </div>
                <div class="details-row">
                  <span class="label">Registration Fee:</span>
                  <span class="value"><strong>${price}</strong></span>
                </div>
              </div>
              
              <div class="next-steps">
                <h3>🚀 What's Next?</h3>
                <ul>
                  <li><strong>Submit Your Pitch Deck:</strong> Click the button below to submit your business pitch deck using your Registration ID</li>
                  <li><strong>Complete Payment:</strong> Ensure your registration fee (${price}) is paid to secure your spot</li>
                  <li><strong>Training Schedule:</strong> You'll receive an email with training dates and platform access details</li>
                  <li><strong>Stay Connected:</strong> Check your email regularly for important program announcements</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${pitchDeckUrl}" class="button">
                  📊 Submit Your Pitch Deck Now →
                </a>
              </div>
              
              <div class="warning">
                <p><strong>⏰ Important:</strong> The pitch deck submission deadline will be communicated separately. Don't wait until the last minute!</p>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280;">If you have any questions or need assistance, please contact our support team at <strong style="color: #059669;">support@quietshelter.org</strong></p>
              
              <p style="margin-top: 25px;">Best regards,<br>
              <strong style="color: #059669;">The FuturenTrepeneurship Team</strong><br>
              Quiet Shelter Empowerment Foundation (QuiSEF)</p>
            </div>
            
            <div class="footer">
              <p><strong>© 2026 Quiet Shelter Empowerment Foundation (QuiSEF)</strong></p>
              <p>Empowering the next generation of Nigerian entrepreneurs</p>
              <p style="margin-top: 15px; font-size: 12px;">This email was sent to ${email} because you registered for FuturenTrepeneurship NYSC 2026.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
Registration Confirmed - FuturenTrepeneurship NYSC 2026

Dear ${fullName},

Congratulations! Your registration has been successfully confirmed.

YOUR REGISTRATION ID: ${uniqueId}
(Keep this ID safe - you'll need it for pitch deck submission)

REGISTRATION SUMMARY:
- Name: ${fullName}
- Email: ${email}
- Category: ${categoryName}
- Registration Fee: ${price}

WHAT'S NEXT?
1. Submit Your Pitch Deck using your Registration ID
2. Complete your payment (${price}) to secure your spot
3. Watch for training schedule and access details
4. Check your email regularly for program updates

Submit your pitch deck here: ${pitchDeckUrl}

If you have any questions, contact us at support@quietshelter.org

Best regards,
The FuturenTrepeneurship Team
Quiet Shelter Empowerment Foundation (QuiSEF)

© 2026 QuiSEF - Empowering the next generation of Nigerian entrepreneurs
    `;

    // Send email
    await transporter.sendMail({
      from: `"FuturenTrepeneurship" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `✅ Registration Confirmed - ${uniqueId} | FuturenTrepeneurship NYSC 2026`,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}