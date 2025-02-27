// app/blog/[slug]/page.tsx (Server Component)
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import NewsPostView from './NewsPostView';

// Define the Post type
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date | string;
  imageUrl?: string;
  categories?: string;
}

// Dynamic metadata generation
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found - QuietShelter Empowerment Foundation',
    };
  }

  return {
    title: `${post.title} - QuietShelter Empowerment Foundation`,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      url: `https://your-domain.com/blog/${params.slug}`,
      images: post.imageUrl ? [post.imageUrl] : ['/images/placeholder.jpg'],
    },
  };
}

// Server component that fetches a single post by ID
async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    console.log(`Fetching post with ID: ${slug}`);
    const docRef = doc(db, 'blogs', slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`Post with ID ${slug} not found`);
      return null;
    }

    const data = docSnap.data();
    let formattedDate: Date | string;

    try {
      formattedDate = data.createdAt
        ? data.createdAt.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt)
        : 'Unknown date';
    } catch (e) {
      console.warn(`Date formatting error for post ${docSnap.id}`, e);
      formattedDate = 'Unknown date';
    }

    return {
      id: docSnap.id,
      title: data.title || 'Untitled Post',
      content: data.content || 'No content available',
      author: data.author || 'Anonymous',
      createdAt: formattedDate,
      imageUrl: data.imageUrl || undefined,
      categories: data.categories || 'Uncategorized',
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error; // Let Next.js handle the error
  }
}

export default async function NewsPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <NewsPostView post={post} />;
}