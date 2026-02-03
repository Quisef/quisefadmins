import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, registrationId, businessName } = await request.json();

    // Validate required fields
    if (!email || !fullName || !registrationId || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
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
            .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .success-badge { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
            .success-badge svg { width: 50px; height: 50px; color: #22c55e; }
            .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .details-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #374151; }
            .value { color: #6b7280; }
            .timeline { margin: 20px 0; }
            .timeline-item { display: flex; gap: 15px; margin-bottom: 15px; }
            .timeline-dot { width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
            .timeline-content { flex: 1; }
            .timeline-content h4 { margin: 0 0 5px 0; color: #1e40af; }
            .timeline-content p { margin: 0; color: #6b7280; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Pitch Deck Submitted! 🚀</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">FuturenTrepeneurship NYSC 2026</p>
            </div>
            
            <div class="content">
              <div class="success-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <p style="text-align: center; font-size: 18px; margin: 0 0 20px 0;">
                <strong>Submission Successful!</strong>
              </p>
              
              <p>Dear <strong>${fullName}</strong>,</p>
              
              <p>Your pitch deck for <strong>${businessName}</strong> has been successfully submitted and received by our review team.</p>
              
              <div class="details">
                <h3 style="margin-top: 0;">Submission Details</h3>
                <div class="details-row">
                  <span class="label">Registration ID:</span>
                  <span class="value" style="font-family: 'Courier New', monospace; font-weight: bold; color: #3b82f6;">${registrationId}</span>
                </div>
                <div class="details-row">
                  <span class="label">Business Name:</span>
                  <span class="value">${businessName}</span>
                </div>
                <div class="details-row">
                  <span class="label">Applicant Name:</span>
                  <span class="value">${fullName}</span>
                </div>
                <div class="details-row">
                  <span class="label">Submission Date:</span>
                  <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1e40af;">📝 What Happens Next?</h3>
                
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h4>Review Process (5-7 Business Days)</h4>
                      <p>Our expert panel will thoroughly evaluate your pitch deck based on innovation, feasibility, market potential, and team capability.</p>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h4>Shortlisting Notification</h4>
                      <p>If your pitch is shortlisted, you'll receive an invitation for a live pitch presentation.</p>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h4>Pitch Presentation</h4>
                      <p>Selected candidates will present their business ideas to our panel of investors and mentors.</p>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <h4>Funding & Mentorship</h4>
                      <p>Winners receive seed funding, dedicated mentorship, and access to our extensive business network.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>💡 Important:</strong> Keep checking your email (including spam/junk folder) for updates on your application status. All official communications will be sent to this email address.
                </p>
              </div>
              
              <p style="margin-top: 30px;">We appreciate your participation in the FuturenTrepeneurship program and look forward to supporting your entrepreneurial journey.</p>
              
              <p>Best regards,<br>
              <strong>Review Team</strong><br>
              Quiet Shelter Empowerment Foundation (QuiSEF)</p>
            </div>
            
            <div class="footer">
              <p>© 2026 Quiet Shelter Empowerment Foundation (QuiSEF)</p>
              <p>Empowering the next generation of Nigerian entrepreneurs</p>
              <p style="margin-top: 10px; font-size: 12px;">
                Questions? Contact us at <a href="mailto:support@futurentrepeneurship.org" style="color: #3b82f6;">support@futurentrepeneurship.org</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"FuturenTrepeneurship" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `Pitch Deck Received - ${businessName} | FuturenTrepeneurship NYSC 2026`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending pitch deck notification:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}