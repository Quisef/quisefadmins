// app/api/webhook/paystack/route.ts
// Alternative webhook URL - uses same direct email flow as paystack-webhook
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
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    console.log('✅ Webhook signature verified');
    console.log('📦 Event type:', payload.event);
    
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
        console.log(`ℹ️ Unhandled event type: ${event}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
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
    console.log('💰 Processing successful payment...');
    
    // Get registration ID from reference (not metadata)
    // When using Paystack API, the reference is in data.reference
    const registrationId = data.reference;
    
    // Get category from metadata
    const metadata = data.metadata || {};
    const categoryId = metadata.category_id;
    const categoryName = metadata.category;
    const fullName = metadata.full_name;
    
    if (!registrationId) {
      console.error('❌ No registration ID in payment data');
      return;
    }
    
    console.log('📝 Registration ID:', registrationId);
    console.log('🏷️ Category ID:', categoryId);
    console.log('📛 Category Name:', categoryName);
    
    // Get the registration from Firebase
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error('❌ Registration not found in database:', registrationId);
      return;
    }
    
    const registrationData = docSnap.data();
    console.log('📄 Found registration for:', registrationData.fullName);
    
    // Update the registration with payment details
    await updateDoc(docRef, {
      paymentStatus: 'completed',
      paymentReference: data.reference,
      paymentMethod: 'paystack',
      paymentChannel: data.channel,
      paidAt: new Date(data.paid_at),
      amountPaid: data.amount / 100, // Convert from kobo to naira
      updatedAt: new Date(),
    });
    
    console.log('✅ Payment status updated in database');
    
    try {
      await sendConfirmationEmail({
        email: registrationData.email,
        fullName: registrationData.fullName,
        uniqueId: registrationId,
        categoryName: registrationData.categoryName,
        categoryId: registrationData.category,
        price: registrationData.price,
      });
      console.log('✅ [WEBHOOK] Confirmation email sent to:', registrationData.email);
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
    
    console.log(`✅ Payment processed successfully for: ${registrationId}`);
    
  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(data: any) {
  try {
    console.log('⚠️ Processing failed payment...');
    
    const registrationId = data.reference;
    
    if (!registrationId) {
      console.error('❌ No registration ID in failed payment');
      return;
    }
    
    // Update the registration in Firebase
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error('❌ Registration not found for failed payment:', registrationId);
      return;
    }
    
    await updateDoc(docRef, {
      paymentStatus: 'failed',
      paymentReference: data.reference,
      failureReason: data.gateway_response,
      updatedAt: new Date(),
    });
    
    console.log(`⚠️ Payment failed for registration: ${registrationId}`);
    console.log(`Reason: ${data.gateway_response}`);
    
  } catch (error) {
    console.error('❌ Error handling failed payment:', error);
    throw error;
  }
}
