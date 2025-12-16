// app/api/paystack-webhook/route.ts
// This is an example webhook handler for Paystack payment verification

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const payload = await request.json();
    
    // Verify the webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const paystackSignature = request.headers.get('x-paystack-signature');
    
    if (hash !== paystackSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
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
        console.log(`Unhandled event type: ${event}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const metadata = data.metadata;
    const applicationId = metadata?.applicationId;
    
    if (!applicationId) {
      console.error('No application ID in metadata');
      return;
    }
    
    // Update the application in Firebase
    await updateDoc(doc(db, 'membershipApplications', applicationId), {
      paymentStatus: 'completed',
      paymentId: data.reference,
      paymentMethod: 'paystack',
      paymentChannel: data.channel,
      paidAt: new Date(data.paid_at),
      amountPaid: data.amount / 100, // Convert from kobo to naira
    });
    
    console.log(`Payment successful for application: ${applicationId}`);
    
    // Optional: Send confirmation email here
    // await sendConfirmationEmail(metadata.email, applicationId);
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(data: any) {
  try {
    const metadata = data.metadata;
    const applicationId = metadata?.applicationId;
    
    if (!applicationId) {
      console.error('No application ID in metadata');
      return;
    }
    
    // Update the application in Firebase
    await updateDoc(doc(db, 'membershipApplications', applicationId), {
      paymentStatus: 'failed',
      paymentId: data.reference,
      failureReason: data.gateway_response,
    });
    
    console.log(`Payment failed for application: ${applicationId}`);
    
    // Optional: Send failure notification
    // await sendPaymentFailureEmail(metadata.email);
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

// Optional: Email notification function
async function sendConfirmationEmail(email: string, applicationId: string) {
  // Implement your email sending logic here
  // You can use SendGrid, Mailgun, or any other email service
  
  console.log(`Sending confirmation email to: ${email}`);
  
  // Example with nodemailer or your preferred service:
  // await emailService.send({
  //   to: email,
  //   subject: 'Membership Application Confirmed',
  //   html: `
  //     <h1>Thank you for your membership!</h1>
  //     <p>Your application ID: ${applicationId}</p>
  //     <p>Your payment has been confirmed.</p>
  //   `
  // });
}