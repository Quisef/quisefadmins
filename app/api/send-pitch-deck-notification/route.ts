import { NextRequest, NextResponse } from 'next/server';

// ────────────────────────────────────────────────
// API Route: /api/send-pitch-deck-notification
// Send confirmation email after pitch deck submission
// ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, registrationId, businessName } = body;

    // Validate required fields
    if (!email || !fullName || !registrationId || !businessName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // TODO: Implement your email sending logic here
    // Example with SendGrid, Resend, or your email service
    
    /*
    // Example with Resend:
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

    if (!RESEND_API_KEY || !FROM_EMAIL) {
      console.warn('Email service not configured');
      return NextResponse.json({ success: true, warning: 'Email service not configured' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `Pitch Deck Submission Confirmed - ${registrationId}`,
        html: `
          <h2>Pitch Deck Submission Received</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for submitting your pitch deck for <strong>${businessName}</strong>.</p>
          <p><strong>Registration ID:</strong> ${registrationId}</p>
          <p>Our team will review your submission and get back to you within 5-7 business days.</p>
          <p>Best regards,<br/>FuturenTrepreneurship Team</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    */

    // For now, just log and return success
    console.log('📧 Pitch deck notification email would be sent to:', {
      email,
      fullName,
      registrationId,
      businessName,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Pitch deck notification logged (email service not yet configured)',
    });

  } catch (error) {
    console.error('❌ Error sending pitch deck notification:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send notification' 
      },
      { status: 500 }
    );
  }
}