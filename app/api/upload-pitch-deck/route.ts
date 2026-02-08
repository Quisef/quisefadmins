import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ────────────────────────────────────────────────
// Pitch deck form data interface
// ────────────────────────────────────────────────
export interface PitchDeckData {
  registrationId: string;
  fullName: string;
  email: string;
  category: string;
  businessName: string;
  businessDescription: string;
  problemStatement: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  fundingNeeds: string;
  teamSize: string;
}

// ────────────────────────────────────────────────
// Upload file to Cloudinary (unsigned upload)
// ────────────────────────────────────────────────
async function uploadToCloudinary(file: File, registrationId: string): Promise<{ url: string; publicId: string }> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and PowerPoint files are allowed.');
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'pitch-decks');
    
    // Add registration ID and timestamp to public_id for better organization
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    formData.append('public_id', `${registrationId}_${timestamp}_${sanitizedFileName}`);
    
    // Add tags for easier management
    formData.append('tags', `registration_${registrationId},pitch_deck,${new Date().getFullYear()}`);

    // Use 'raw' endpoint for non-image files (PDF, PowerPoint)
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Upload failed with status: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('Cloudinary upload failed - no secure URL returned');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to upload pitch deck. Please try again.'
    );
  }
}

// ────────────────────────────────────────────────
// Save pitch deck to Firestore + Cloudinary
// ────────────────────────────────────────────────
export async function savePitchDeck(
  data: PitchDeckData,
  file: File
): Promise<void> {
  try {
    // 1. Upload file to Cloudinary
    const { url: downloadURL, publicId } = await uploadToCloudinary(file, data.registrationId);

    // 2. Save to Firestore
    await addDoc(collection(db, 'pitch-decks'), {
      ...data,
      pitchDeckUrl: downloadURL,
      pitchDeckFileName: file.name,
      cloudinaryPublicId: publicId,
      fileSize: file.size,
      fileType: file.type,
      submissionDate: Timestamp.now(),
      status: 'submitted',
    });

    // 3. Send confirmation email
    await sendPitchDeckNotification(
      data.email,
      data.fullName,
      data.registrationId,
      data.businessName
    );
  } catch (error) {
    console.error('Error saving pitch deck:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to save pitch deck. Please try again.'
    );
  }
}

// ────────────────────────────────────────────────
// Send pitch deck confirmation email via API
// ────────────────────────────────────────────────
export async function sendPitchDeckNotification(
  email: string,
  fullName: string,
  registrationId: string,
  businessName: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-pitch-deck-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        fullName,
        registrationId,
        businessName,
      }),
    });

    if (!response.ok) {
      console.error('Email API returned error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending pitch deck notification:', error);
    return false;
  }
}