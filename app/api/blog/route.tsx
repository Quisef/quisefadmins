// app/api/blogs/route.js in your Next.js admin panel
import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import cloudinary from '../../lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Validate form data
    if (!formData.get('title') || !formData.get('content') || !formData.get('author')) {
      return NextResponse.json(
        { error: 'Title, content, and author are required fields' },
        { status: 400 }
      );
    }

    let imageUrl = null;
    
    // Handle image upload to Cloudinary
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataURI = `data:${imageFile.type};base64,${base64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'blog-images',
      });
      imageUrl = result.secure_url;
    }

    // Create blog post data
    const blogData = {
      title: formData.get('title'),
      content: formData.get('content'),
      author: formData.get('author'),
      categories: formData.get('categories') || [], // Ensure it's an array or handle accordingly
      date: formData.get('date') || new Date().toISOString(), // Default to current date if not provided
      imageUrl,
      slug: formData.get('title')
        ? formData.get('title').toLowerCase().replace(/\s+/g, '-')
        : 'default-slug', // Fallback to default slug if no title
      createdAt: new Date().toISOString(),
      isPublished: true
    };

    // Add to Firestore
    const blogsCollection = collection(db, 'blogs');
    const docRef = await addDoc(blogsCollection, blogData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      ...blogData
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}