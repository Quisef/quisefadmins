import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

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
// Upload file to Cloudinary
// ────────────────────────────────────────────────
async function uploadToCloudinary(file: File, registrationId: string): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append('folder', 'pitch-decks');
  formData.append('public_id', `${registrationId}_${Date.now()}`);
  
  // You can add tags for easier management
  formData.append('tags', `registration_${registrationId},pitch_deck`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
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
    throw new Error('Failed to save pitch deck');
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