// app/api/pitchdeck/route.ts
// Handles full pitch deck submission: form data + file upload to Cloudinary + Firestore save
import { NextRequest, NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx'];

function isFileTypeAllowed(file: File): boolean {
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;
  if (ALLOWED_MIME_TYPES.includes(file.type)) return true;
  return false;
}

async function uploadToCloudinary(
  file: File,
  registrationId: string
): Promise<{ url: string; publicId: string }> {
  const cloudinary = (await import('@/lib/cloudinary')).default;
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'futurentrepeneurship/pitch-decks',
        resource_type: 'raw',
        public_id: `${registrationId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        tags: [`registration_${registrationId}`, 'pitch_deck', new Date().getFullYear().toString()],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  if (!result?.secure_url || !result?.public_id) {
    throw new Error('Cloudinary upload did not return URL');
  }

  return { url: result.secure_url, publicId: result.public_id };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pitchDeck') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Pitch deck file is required' },
        { status: 400 }
      );
    }

    if (!isFileTypeAllowed(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and PowerPoint (.ppt, .pptx) are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const registrationId = String(formData.get('registrationId') || '').trim();
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const category = String(formData.get('category') || '').trim();

    if (!registrationId || !fullName || !email) {
      return NextResponse.json(
        { error: 'Registration ID, full name, and email are required.' },
        { status: 400 }
      );
    }

    // Verify registration and eligibility (bypass in test mode for local testing)
    const testMode = process.env.PITCH_DECK_TEST_MODE === 'true' || process.env.NODE_ENV === 'development';

    if (!testMode) {
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');

      const PITCH_DECK_ELIGIBLE = ['fully-funded', 'partially-funded'];
      const regRef = doc(db, 'registrations', registrationId);
      const regSnap = await getDoc(regRef);
      if (!regSnap.exists()) {
        return NextResponse.json(
          { error: 'Registration not found. Please complete payment first.' },
          { status: 404 }
        );
      }
      const regData = regSnap.data();
      if (regData.paymentStatus !== 'completed') {
        return NextResponse.json(
          { error: 'Payment must be completed before submitting a pitch deck.' },
          { status: 403 }
        );
      }
      if (!PITCH_DECK_ELIGIBLE.includes(String(regData.category || ''))) {
        return NextResponse.json(
          { error: 'Pitch deck submission is only available for Fully Funded and Partially Funded registrations.' },
          { status: 403 }
        );
      }
    }

    // Upload to Cloudinary
    const { url: pitchDeckUrl, publicId: cloudinaryPublicId } = await uploadToCloudinary(file, registrationId);

    const { db } = await import('@/lib/firebase');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const docId = `PD-${nanoid()}`;
    const pitchDeckData = {
      id: docId,
      registrationId,
      fullName,
      email,
      category,
      businessName: String(formData.get('businessName') || '').trim(),
      businessDescription: String(formData.get('businessDescription') || '').trim(),
      problemStatement: String(formData.get('problemStatement') || '').trim(),
      solution: String(formData.get('solution') || '').trim(),
      targetMarket: String(formData.get('targetMarket') || '').trim(),
      revenueModel: String(formData.get('revenueModel') || '').trim(),
      fundingNeeds: String(formData.get('fundingNeeds') || '').trim(),
      teamSize: String(formData.get('teamSize') || '').trim(),
      pitchDeckUrl,
      pitchDeckFileName: file.name,
      cloudinaryPublicId,
      fileSize: file.size,
      fileType: file.type,
      fileFormat: file.name.split('.').pop() || 'unknown',
      submissionDate: serverTimestamp(),
      status: 'submitted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'pitch-decks', docId), pitchDeckData);

    console.log('✅ Pitch deck submitted:', docId, registrationId);

    return NextResponse.json({
      success: true,
      id: docId,
      message: 'Pitch deck submitted successfully',
    });
  } catch (error) {
    console.error('❌ Pitch deck submission error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Pitch deck submission failed',
      },
      { status: 500 }
    );
  }
}
