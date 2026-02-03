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

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .registration-id { background: #f0fdfa; border: 2px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .registration-id-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
            .registration-id-value { font-size: 32px; font-weight: bold; color: #059669; margin: 10px 0; font-family: 'Courier New', monospace; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .details-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #374151; }
            .value { color: #6b7280; }
            .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
            .next-steps h3 { margin-top: 0; color: #1e40af; }
            .next-steps ul { margin: 10px 0; padding-left: 20px; }
            .next-steps li { margin: 8px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Registration Confirmed! 🎉</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">FuturenTrepeneurship NYSC 2026</p>
            </div>
            
            <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>
              
              <p>Congratulations! Your registration for the FuturenTrepeneurship Youth Empowerment & Development Program has been successfully confirmed.</p>
              
              <div class="registration-id">
                <div class="registration-id-label">Your Registration ID</div>
                <div class="registration-id-value">${uniqueId}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Keep this ID safe - you'll need it for pitch deck submission</p>
              </div>
              
              <div class="details">
                <h3 style="margin-top: 0;">Registration Summary</h3>
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
                  <span class="value">${price}</span>
                </div>
              </div>
              
              <div class="next-steps">
                <h3>📋 What's Next?</h3>
                <ul>
                  <li><strong>Submit Your Pitch Deck:</strong> Use your Registration ID to submit your business pitch deck</li>
                  <li><strong>Complete Payment:</strong> Ensure your registration fee is paid to confirm your spot</li>
                  <li><strong>Training Begins:</strong> You'll receive an email with training schedule and access details</li>
                  <li><strong>Stay Updated:</strong> Check your email regularly for program announcements</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pitch-deck?id=${encodeURIComponent(uniqueId)}&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&category=${encodeURIComponent(categoryName)}" class="button">
                  Submit Your Pitch Deck →
                </a>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>
              <strong>Quiet Shelter Empowerment Foundation (QuiSEF)</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2026 Quiet Shelter Empowerment Foundation (QuiSEF)</p>
              <p>Empowering the next generation of Nigerian entrepreneurs</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"FuturenTrepeneurship" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `Registration Confirmed - ${uniqueId} | FuturenTrepeneurship NYSC 2026`,
      html: htmlContent,
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