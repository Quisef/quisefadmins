// app/api/send-confirmation-email/route.ts
// Used by admin panel as fallback for manual payments (bank transfer, etc.)
import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, uniqueId, categoryName, categoryId, price } = await request.json();

    if (!email || !fullName || !uniqueId || !categoryName || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📧 [EMAIL] Sending confirmation (admin fallback) to:', email);
    await sendConfirmationEmail({
      email,
      fullName,
      uniqueId,
      categoryName,
      categoryId: categoryId || '',
      price,
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    });
  } catch (error) {
    console.error('❌ [EMAIL] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}