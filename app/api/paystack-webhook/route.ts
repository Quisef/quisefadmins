// app/api/paystack-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get the request body as text for signature verification
    const text = await request.text();
    const payload = JSON.parse(text);
    
    // Verify the webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(text)
      .digest('hex');
    
    const paystackSignature = request.headers.get('x-paystack-signature');
    
    if (hash !== paystackSignature) {
      console.error('❌ [WEBHOOK] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    console.log('✅ [WEBHOOK] Signature verified');
    console.log('📦 [WEBHOOK] Event type:', payload.event);
    
    // Handle different event types
    const event = payload.event;
    
    switch (event) {
      case 'charge.success':
        await handleSuccessfulPayment(payload.data);
        break;
        
      case 'charge.failed':
        await handleFailedPayment(payload.data);
        break;
        
      default:
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    console.log('💰 [WEBHOOK] Processing successful payment...');
    
    // Get registration ID from reference
    const registrationId = data.reference;
    
    if (!registrationId) {
      console.error('❌ [WEBHOOK] No registration ID in payment data');
      return;
    }
    
    console.log('📝 [WEBHOOK] Registration ID:', registrationId);
    
    // Get the registration from Firebase
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error('❌ [WEBHOOK] Registration not found:', registrationId);
      return;
    }
    
    const registrationData = docSnap.data();
    console.log('📄 [WEBHOOK] Found registration for:', registrationData.fullName);
    
    // ✅ STEP 1: Update payment status first (most critical)
    await updateDoc(docRef, {
      paymentStatus: 'completed',
      paymentReference: data.reference,
      paymentMethod: 'paystack',
      paymentChannel: data.channel,
      paidAt: new Date(data.paid_at),
      amountPaid: data.amount / 100, // Convert from kobo to naira
      updatedAt: new Date(),
    });
    
    console.log('✅ [WEBHOOK] Payment status updated to completed');
    
    // ✅ STEP 2: Send confirmation email with error handling
    // If email fails, payment is still successful and admin can send manually
    try {
      console.log('📧 [WEBHOOK] Sending confirmation email to:', registrationData.email);
      
      await sendConfirmationEmail({
        email: registrationData.email,
        fullName: registrationData.fullName,
        uniqueId: registrationId,
        categoryName: registrationData.categoryName,
        categoryId: registrationData.category,
        price: registrationData.price,
      });
      
      // ✅ STEP 3: Update email sent status
      await updateDoc(docRef, {
        emailSent: true,
        emailSentAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ [WEBHOOK] Confirmation email sent successfully');
      console.log('✅ [WEBHOOK] Email status updated in Firestore');
      
    } catch (emailError) {
      console.error('❌ [WEBHOOK] Error sending confirmation email:', emailError);
      console.log('⚠️ [WEBHOOK] Payment succeeded but email failed. Admin can send manually.');
      // DON'T throw - payment was successful, email is just a notification
    }
    
    console.log(`✅ [WEBHOOK] Payment fully processed for: ${registrationId}`);
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error handling successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(data: any) {
  try {
    console.log('⚠️ [WEBHOOK] Processing failed payment...');
    
    const registrationId = data.reference;
    
    if (!registrationId) {
      console.error('❌ [WEBHOOK] No registration ID in failed payment');
      return;
    }
    
    // Update the registration in Firebase
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error('❌ [WEBHOOK] Registration not found for failed payment:', registrationId);
      return;
    }
    
    await updateDoc(docRef, {
      paymentStatus: 'failed',
      paymentReference: data.reference,
      failureReason: data.gateway_response,
      updatedAt: new Date(),
    });
    
    console.log(`⚠️ [WEBHOOK] Payment failed for: ${registrationId}`);
    console.log(`Reason: ${data.gateway_response}`);
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error handling failed payment:', error);
    throw error;
  }
}

/**
 * Send confirmation email by calling our email API
 * This keeps email logic centralized and allows for manual sending
 */
function getAppBaseUrl(): string {
  // Prefer explicit config, then Vercel, then production fallback
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://quietshelter.org';
}

async function sendConfirmationEmail(params: {
  email: string;
  fullName: string;
  uniqueId: string;
  categoryName: string;
  categoryId: string;
  price: string;
}) {
  try {
    const baseUrl = getAppBaseUrl();
    const url = `${baseUrl}/api/send-confirmation-email`;
    console.log('📧 [WEBHOOK] Calling email API:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [WEBHOOK] Email API error:', error);
      throw new Error('Failed to send confirmation email');
    }
    
    const result = await response.json();
    console.log('✅ [WEBHOOK] Email API response:', result);
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error calling email API:', error);
    throw error; // Re-throw so caller can handle
  }
}