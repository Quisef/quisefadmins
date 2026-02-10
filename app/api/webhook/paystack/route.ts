// app/api/webhook/paystack/route.ts
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
    
    const metadata = data.metadata;
    const registrationId = metadata?.registration_id;
    const categoryId = metadata?.category_id;
    
    if (!registrationId) {
      console.error('❌ No registration ID in metadata');
      return;
    }
    
    console.log(`📝 Registration ID: ${registrationId}`);
    console.log(`🏷️ Category ID: ${categoryId}`);
    
    // Get the registration from Firebase
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error('❌ Registration not found in database');
      return;
    }
    
    const registrationData = docSnap.data();
    
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
    
    // Send confirmation email with pitch deck link
    await sendConfirmationEmail({
      email: registrationData.email,
      fullName: registrationData.fullName,
      uniqueId: registrationId,
      categoryName: registrationData.categoryName,
      categoryId: registrationData.category,
      price: registrationData.price,
    });
    
    console.log(`✅ Payment processed successfully for: ${registrationId}`);
    
  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(data: any) {
  try {
    console.log('⚠️ Processing failed payment...');
    
    const metadata = data.metadata;
    const registrationId = metadata?.registration_id;
    
    if (!registrationId) {
      console.error('❌ No registration ID in metadata');
      return;
    }
    
    // Update the registration in Firebase
    const docRef = doc(db, 'registrations', registrationId);
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
async function sendConfirmationEmail(params: {
  email: string;
  fullName: string;
  uniqueId: string;
  categoryName: string;
  categoryId: string;
  price: string;
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send confirmation email');
    }
    
    console.log('✅ Confirmation email sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    // Don't throw - we don't want email failures to break the webhook
    // The payment was successful, email is just a notification
  }
}