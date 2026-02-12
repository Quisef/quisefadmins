import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import axios from 'axios';

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
// Upload file to Cloudinary (unsigned upload - like blog)
// ────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadToCloudinary(
  file: File,
  registrationId: string
): Promise<{ url: string; publicId: string }> {
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
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'futurentrepeneurship/pitch-decks');
    
    // Add registration ID and timestamp to public_id for better organization
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    formData.append('public_id', `${registrationId}_${timestamp}_${sanitizedFileName}`);
    
    // Add tags for easier management
    formData.append('tags', `registration_${registrationId},pitch_deck,${new Date().getFullYear()}`);

    // Use 'raw' endpoint for non-image files (PDF, PowerPoint)
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    
    const response = await axios.post(apiUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 seconds for large files
    });

    if (!response.data.secure_url) {
      throw new Error('Cloudinary upload failed - no secure URL returned');
    }

    console.log('✅ File uploaded to Cloudinary:', response.data.secure_url);

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Upload failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    
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
    console.log('📤 Starting pitch deck upload...');
    
    // 1. Upload file to Cloudinary (unsigned upload)
    const { url: downloadURL, publicId } = await uploadToCloudinary(file, data.registrationId);
    console.log('✅ File uploaded successfully to Cloudinary');

    // 2. Save to Firestore
    console.log('💾 Saving pitch deck metadata to Firestore...');
    const docRef = await addDoc(collection(db, 'pitch-decks'), {
      ...data,
      pitchDeckUrl: downloadURL,
      pitchDeckFileName: file.name,
      cloudinaryPublicId: publicId,
      fileSize: file.size,
      fileType: file.type,
      submissionDate: Timestamp.now(),
      status: 'submitted',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Pitch deck saved to Firestore with ID:', docRef.id);

    // 3. Send confirmation email (non-blocking - don't fail if email fails)
    try {
      console.log('📧 Sending confirmation email...');
      await sendPitchDeckNotification(
        data.email,
        data.fullName,
        data.registrationId,
        data.businessName
      );
      console.log('✅ Confirmation email sent successfully');
    } catch (emailError) {
      // Log but don't fail the whole submission if email fails
      console.warn('⚠️ Email notification failed, but pitch deck was saved:', emailError);
    }
  } catch (error) {
    console.error('❌ Error saving pitch deck:', error);
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
async function sendPitchDeckNotification(
  email: string,
  fullName: string,
  registrationId: string,
  businessName: string
): Promise<void> {
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

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = 'Email notification failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = `Email notification failed: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Email notification failed');
    }
  } catch (error) {
    console.error('❌ Error sending pitch deck notification:', error);
    throw error; // Re-throw so it can be caught by savePitchDeck
  }
}