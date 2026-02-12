// app/api/admin/confirm-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    // ✅ STEP 3: Send confirmation email
    try {
      console.log('📧 [ADMIN] Sending confirmation email...');
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quietshelter.org';
      
      const emailResponse = await fetch(`${baseUrl}/api/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          fullName: fullName,
          uniqueId: registrationId,
          categoryName: categoryName || existingData.categoryName,
          categoryId: categoryId || existingData.category,
          price: price || existingData.price,
        }),
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json();
        console.error('❌ [ADMIN] Email sending failed:', emailError);
        
        // Payment is confirmed but email failed
        // Update Firestore to reflect this
        await updateDoc(docRef, {
          emailSent: false,
          emailError: emailError.error || 'Failed to send email',
          updatedAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          warning: 'Payment confirmed but email failed. Please send email manually.',
          message: 'Payment status updated to completed, but confirmation email could not be sent.',
          paymentConfirmed: true,
          emailSent: false,
        });
      }

      const emailResult = await emailResponse.json();
      console.log('✅ [ADMIN] Confirmation email sent successfully');

      // Note: The email API will update emailSent and emailSentAt in Firestore

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and confirmation email sent successfully',
        paymentConfirmed: true,
        emailSent: true,
      });

    } catch (emailError) {
      console.error('❌ [ADMIN] Error sending confirmation email:', emailError);
      
      // Payment is confirmed but email failed
      await updateDoc(docRef, {
        emailSent: false,
        emailError: emailError instanceof Error ? emailError.message : 'Email sending failed',
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        warning: 'Payment confirmed but email failed',
        message: 'Payment status updated, but confirmation email could not be sent. You can resend it manually.',
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