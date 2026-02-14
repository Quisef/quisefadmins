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
    
    // Send confirmation email
    try {
      await sendConfirmationEmail({
        email: registrationData.email,
        fullName: registrationData.fullName,
        uniqueId: registrationId,
        categoryName: registrationData.categoryName,
        categoryId: registrationData.category,
        price: registrationData.price,
      });
      await updateDoc(docRef, {
        emailSent: true,
        emailSentAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ [WEBHOOK] Confirmation email sent to:', registrationData.email);
    } catch (emailError) {
      console.error('❌ [WEBHOOK] Email failed:', emailError);
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

/**
 * Send confirmation email by calling our email API
 */
function getAppBaseUrl(): string {
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
    console.log('📧 Sending confirmation email to:', params.email);
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
      console.error('❌ Email API error:', error);
      throw new Error('Failed to send confirmation email');
    }
    
    const result = await response.json();
    console.log('✅ Email API response:', result);
    console.log('✅ Confirmation email sent successfully to:', params.email);
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    // Don't throw - we don't want email failures to break the webhook
    // The payment was successful, email is just a notification
  }
}