// app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Paystack Webhook Handler (Firebase)
 * 
 * This endpoint:
 * 1. Verifies webhook signature from Paystack
 * 2. Updates registration payment status in Firestore
 * 3. Sends conditional confirmation email
 * 
 * Setup in Paystack Dashboard:
 * Settings → API Keys & Webhooks → Add webhook URL:
 * https://yourdomain.com/api/webhooks/paystack
 */

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('❌ No signature provided');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('❌ PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('❌ Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the verified event
    const event = JSON.parse(body);

    console.log('✅ Paystack webhook received:', {
      event: event.event,
      reference: event.data?.reference,
      status: event.data?.status,
    });

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(data: any) {
  const { reference, customer, metadata, channel, paid_at, amount } = data;

  console.log('💰 Processing successful payment:', {
    reference,
    email: customer.email,
    category: metadata?.category,
  });

  try {
    // 1. Get registration from Firestore
    const registrationRef = doc(db, 'registrations', reference);
    const registrationSnap = await getDoc(registrationRef);

    if (!registrationSnap.exists()) {
      console.error('❌ Registration not found:', reference);
      return;
    }

    const registrationData = registrationSnap.data();

    // 2. Update payment status in Firestore
    await updateDoc(registrationRef, {
      paymentStatus: 'completed',
      paymentReference: reference,
      paymentMethod: 'paystack',
      paymentChannel: channel,
      paidAt: new Date(paid_at),
      amountPaid: amount / 100, // Convert from kobo to naira
      updatedAt: new Date(),
    });

    console.log('✅ Updated payment status in Firebase for:', reference);

    // 3. Determine if pitch deck link should be included
    const categoryId = registrationData.category || '';
    const includePitchDeck = categoryId !== 'self-funded';

    console.log('📧 Sending email:', {
      email: registrationData.email,
      includePitchDeck,
      category: registrationData.categoryName,
    });

    // 4. Send confirmation email with conditional content
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/send-confirmation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationData.email,
          fullName: registrationData.fullName,
          uniqueId: reference,
          categoryName: registrationData.categoryName,
          price: registrationData.price,
          includePitchDeck, // Conditional parameter
        }),
      }
    );

    if (emailResponse.ok) {
      console.log('✅ Confirmation email sent to:', registrationData.email);
    } else {
      const errorText = await emailResponse.text();
      console.error('❌ Failed to send confirmation email:', errorText);
    }

  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data: any) {
  const { reference, customer, gateway_response } = data;

  console.log('❌ Payment failed:', {
    reference,
    email: customer.email,
    reason: gateway_response,
  });

  try {
    // Update registration status in Firestore
    const registrationRef = doc(db, 'registrations', reference);
    const registrationSnap = await getDoc(registrationRef);

    if (!registrationSnap.exists()) {
      console.error('❌ Registration not found:', reference);
      return;
    }

    await updateDoc(registrationRef, {
      paymentStatus: 'failed',
      paymentReference: reference,
      failureReason: gateway_response,
      updatedAt: new Date(),
    });

    console.log('✅ Updated failed payment status for:', reference);

    // Optional: Send failure notification email
    // You can create a separate API endpoint for this
    // await sendPaymentFailureEmail(customer.email, reference);

  } catch (error) {
    console.error('❌ Error handling failed payment:', error);
    throw error;
  }
}

// Disable body parsing for webhook signature verification
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';