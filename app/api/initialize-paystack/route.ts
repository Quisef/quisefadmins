// app/api/initialize-paystack/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      amount,           // amount in kobo (e.g. 2000000 for ₦20,000)
      reference,
      callback_url,
      metadata = {},
    } = body;

    // Validation
    if (!email || !amount || !reference || !callback_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, amount, reference, callback_url' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const amountInKobo = Number(amount);
    if (isNaN(amountInKobo) || amountInKobo <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount (must be positive number in kobo)' },
        { status: 400 }
      );
    }

    const paystackPayload = {
      email: email.trim().toLowerCase(),
      amount: amountInKobo,
      reference: reference.trim(),
      callback_url: callback_url.trim(),
      metadata: {
        registration_id: reference,
        ...metadata,
      },
      channels: ['card', 'bank_transfer'], // customize as needed
    };

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error('Missing PAYSTACK_SECRET_KEY');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(paystackPayload),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Paystack initialize error:', result);
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to initialize transaction',
          paystackResponse: result,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference,
      },
    });
  } catch (error) {
    console.error('Initialize Paystack route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during payment initialization',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}