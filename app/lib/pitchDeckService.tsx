async function uploadToCloudinary(
  file: File,
  registrationId: string
): Promise<{ url: string; publicId: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('registrationId', registrationId);

    const response = await fetch('/api/upload-pitch-deck', {
      method: 'POST',
      body: formData, // Don't set Content-Type header - browser sets it automatically with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error('Upload failed - no URL returned');
    }

    return {
      url: data.url,
      publicId: data.publicId,
    };
  } catch (error) {
    console.error('❌ Upload Error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to upload pitch deck. Please try again.'
    );
  }
}