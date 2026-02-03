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
// Upload file via the /api/upload-pitch-deck route
// (keeps Cloudinary credentials server-side only)
// ────────────────────────────────────────────────
async function uploadViaSelfApi(
  file: File,
  registrationId: string
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('registrationId', registrationId);

  // Do NOT manually set Content-Type here.
  // The browser must set it automatically so the multipart boundary is included.
  const response = await fetch('/api/upload-pitch-deck', {
    method: 'POST',
    body: formData,
  });

  // Parse the JSON body regardless of status so we can read the error message
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed with an unknown error');
  }

  return {
    url: data.url,
    publicId: data.publicId,
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
    // 1. Upload file via API route → Cloudinary (server-side)
    const { url: downloadURL, publicId } = await uploadViaSelfApi(
      file,
      data.registrationId
    );

    // 2. Save metadata to Firestore
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
    // Log the real error so you can debug it in the console
    console.error('Error saving pitch deck:', error);
    // Re-throw so the calling component receives the actual message
    throw error;
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