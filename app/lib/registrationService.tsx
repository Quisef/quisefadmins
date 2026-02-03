import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// ────────────────────────────────────────────────
// Generate unique registration ID
// ────────────────────────────────────────────────
export function generateUniqueId(): string {
  const prefix = 'FTE';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}${random}`;
}

// ────────────────────────────────────────────────
// Save registration to Firestore
// ────────────────────────────────────────────────
export interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  category: string;
  categoryName: string;
  price: string;
}

export async function saveRegistration(
  data: RegistrationData,
  uniqueId: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'registrations'), {
      ...data,
      uniqueId,
      registrationDate: Timestamp.now(),
      status: 'active',
    });
  } catch (error) {
    console.error('Error saving registration:', error);
    throw new Error('Failed to save registration');
  }
}

// ────────────────────────────────────────────────
// Send confirmation email via API
// ────────────────────────────────────────────────
export async function sendConfirmationEmail(
  email: string,
  fullName: string,
  uniqueId: string,
  categoryName: string,
  price: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        fullName,
        uniqueId,
        categoryName,
        price,
      }),
    });

    if (!response.ok) {
      console.error('Email API returned error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}