// app/api/test-payment-confirmation/route.ts
// Simulates Paystack webhook for testing - sends confirmation email without real payment

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_CONFIRMATION !== 'true') {
    return NextResponse.json(
      { error: 'Test endpoint disabled in production' },
      { status: 403 }
    );
  }

  try {
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: 'registrationId is required' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    await updateDoc(docRef, {
      paymentStatus: 'completed',
      paymentReference: `TEST-${registrationId}`,
      paymentMethod: 'paystack',
      paymentChannel: 'test',
      paidAt: new Date(),
      amountPaid: 20000,
      updatedAt: new Date(),
    });

    try {
      await sendConfirmationEmail({
        email: data.email,
        fullName: data.fullName,
        uniqueId: registrationId,
        categoryName: data.categoryName,
        categoryId: data.category || '',
        price: data.price,
      });
      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        emailSent: true,
        message: `Test confirmation sent to ${data.email}`,
      });
    } catch (emailErr) {
      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        emailSent: false,
        error: emailErr instanceof Error ? emailErr.message : 'Email failed',
      });
    }
  } catch (error) {
    console.error('Test confirmation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    );
  }
}
