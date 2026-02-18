// app/api/paystack-webhook/route.ts
// Primary flow: Paystack sends webhook on payment success → we send confirmation email immediately
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

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
    
    // ✅ STEP 2: Send confirmation email immediately (primary flow - no HTTP, direct call)
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
      console.log('✅ [WEBHOOK] Confirmation email sent successfully');
      // Clear any previous error
      await updateDoc(docRef, { emailError: null, updatedAt: new Date() });
    } catch (emailError) {
      const errMsg = emailError instanceof Error ? emailError.message : String(emailError);
      console.error('❌ [WEBHOOK] Email failed:', errMsg);
      await updateDoc(docRef, {
        emailError: errMsg,
        emailErrorAt: new Date(),
        updatedAt: new Date(),
      });
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
