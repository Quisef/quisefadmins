// app/api/admin-payment-confirmation/route.ts
// Fallback for manual payments (bank transfer, cash, etc.) - admin confirms and triggers email
import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

/**
 * Admin Manual Payment Confirmation API
 * 
 * This endpoint allows admins to manually confirm payments that were made
 * outside the system (bank transfer, cash, etc.) and trigger the same flow
 * as if the payment succeeded via Paystack webhook.
 */

export async function POST(request: NextRequest) {
  try {
    const { 
      registrationId, 
      fullName, 
      email, 
      categoryName, 
      categoryId, 
      price 
    } = await request.json();

    // Validate required fields
    if (!registrationId || !email || !fullName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: registrationId, email, fullName' 
        },
        { status: 400 }
      );
    }

    console.log('🔐 [ADMIN] Manual payment confirmation requested');
    console.log('📝 [ADMIN] Registration ID:', registrationId);
    console.log('👤 [ADMIN] User:', fullName);

    // ✅ STEP 1: Verify registration exists
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('❌ [ADMIN] Registration not found:', registrationId);
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    const existingData = docSnap.data();
    console.log('📄 [ADMIN] Found registration, current status:', existingData.paymentStatus);

    // ✅ STEP 2: Update payment status to completed
    await updateDoc(docRef, {
      paymentStatus: 'completed',
      paymentReference: `MANUAL-${registrationId}`,
      paymentMethod: 'manual_confirmation',
      paymentChannel: 'admin_panel',
      paidAt: new Date(),
      amountPaid: price ? parseFloat(price.replace(/[^0-9.]/g, '')) : null,
      confirmedBy: 'admin', // Track that this was manually confirmed
      manualConfirmation: true, // Flag for reporting
      updatedAt: new Date(),
    });

    console.log('✅ [ADMIN] Payment status updated to completed');

    // ✅ STEP 3: Send confirmation email (fallback for manual payments)
    try {
      await sendConfirmationEmail({
        email,
        fullName,
        uniqueId: registrationId,
        categoryName: categoryName || existingData.categoryName,
        categoryId: categoryId || existingData.category,
        price: price || existingData.price,
      });
      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and confirmation email sent successfully',
        paymentConfirmed: true,
        emailSent: true,
      });
    } catch (emailError) {
      console.error('❌ [ADMIN] Email failed:', emailError);
      await updateDoc(docRef, {
        emailSent: false,
        emailError: emailError instanceof Error ? emailError.message : 'Failed',
        updatedAt: new Date(),
      });
      return NextResponse.json({
        success: true,
        warning: 'Payment confirmed but email failed. Use "Send Email" to resend.',
        paymentConfirmed: true,
        emailSent: false,
      });
    }

  } catch (error) {
    console.error('❌ [ADMIN] Error in manual payment confirmation:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to confirm payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Retrieve all manual confirmations (optional, for auditing)
 */
export async function GET(request: NextRequest) {
  try {
    // This could be used to get audit logs of manual confirmations
    // For now, return a simple response
    return NextResponse.json({
      success: true,
      message: 'Manual payment confirmation endpoint is active',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve data',
      },
      { status: 500 }
    );
  }
}