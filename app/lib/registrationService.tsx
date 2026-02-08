// lib/registrationService.ts

/**
 * Generate a unique registration ID
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `FTE26-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Save registration data to your database
 */
export async function saveRegistration(
  data: {
    fullName: string;
    email: string;
    phone: string;
    areaOfInterest: string;
    category: string;
    categoryName: string;
    price: string;
  },
  uniqueId: string
): Promise<boolean> {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        registrationId: uniqueId,
        registeredAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save registration');
    }

    return true;
  } catch (error) {
    console.error('Error saving registration:', error);
    throw error;
  }
}

/**
 * Send confirmation email with conditional pitch deck link
 * @param email - Recipient email
 * @param fullName - Recipient name
 * @param registrationId - Unique registration ID
 * @param categoryName - Selected category name
 * @param price - Amount paid
 * @param includePitchDeck - Whether to include pitch deck link (false for self-funded)
 */
export async function sendConfirmationEmail(
  email: string,
  fullName: string,
  registrationId: string,
  categoryName: string,
  price: string,
  includePitchDeck: boolean = true
): Promise<boolean> {
  try {
    // Call your actual API endpoint
    const response = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        fullName,
        uniqueId: registrationId,
        categoryName,
        price,
        includePitchDeck, // Pass the conditional parameter
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}