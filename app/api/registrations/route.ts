// app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Registration API Endpoint (Firebase)
 * Saves registration data to Firestore before payment
 */

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'areaOfInterest',
      'category',
      'categoryName',
      'price',
      'registrationId',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^\+?\d{9,15}$/;
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Prepare registration data for Firebase
    const registrationData = {
      registrationId: data.registrationId,
      fullName: data.fullName,
      email: data.email.toLowerCase(), // Normalize email
      phone: data.phone,
      areaOfInterest: data.areaOfInterest,
      category: data.category,
      categoryName: data.categoryName,
      price: data.price,
      paymentStatus: 'pending',
      paymentReference: null,
      paymentMethod: null,
      paymentChannel: null,
      paidAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save to Firestore
    // Use registrationId as document ID for easy lookup
    await setDoc(
      doc(db, 'registrations', data.registrationId),
      registrationData
    );

    console.log('✅ Registration saved to Firebase:', data.registrationId);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registration saved successfully',
      data: {
        registrationId: data.registrationId,
        email: data.email,
      },
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save registration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Retrieve registration by ID
 * Optional: For checking registration status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Fetch from Firestore
    const { getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'registrations', registrationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: docSnap.data(),
    });

  } catch (error) {
    console.error('❌ GET registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve registration',
      },
      { status: 500 }
    );
  }
}