// lib/registrationService.ts
import { customAlphabet } from 'nanoid';

/**
 * Generate a unique registration ID
 * Format: FTE26-XXXXX (5 alphanumeric characters)
 */
export function generateUniqueId(): string {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5);
  return `FTE26-${nanoid()}`;
}

/**
 * Save registration to Firebase via API
 * Called before redirecting to payment
 */
export async function saveRegistration(
  registrationData: {
    fullName: string;
    email: string;
    phone: string;
    areaOfInterest: string;
    category: string;
    categoryName: string;
    price: string;
  },
  registrationId: string
): Promise<void> {
  try {
    console.log('💾 Saving registration:', registrationId);

    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...registrationData,
        registrationId,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to save registration');
    }

    console.log('✅ Registration saved successfully');
  } catch (error) {
    console.error('❌ Error saving registration:', error);
    throw error;
  }
}

/**
 * Get registration by ID
 * Used by payment success page
 */
export async function getRegistration(registrationId: string) {
  try {
    const response = await fetch(`/api/registrations?id=${encodeURIComponent(registrationId)}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to get registration');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error fetching registration:', error);
    throw error;
  }
}