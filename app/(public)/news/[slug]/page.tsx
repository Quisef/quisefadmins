// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import NewsPostView from './NewsPostView';

// Define the Post interface
export interface NewsPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date | string;
  imageUrl?: string;
  categories?: string;
}

// Change this to use params directly without the type annotation
export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <NewsPostView post={post} />;
}

// Update the generateMetadata function the same way
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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
      url: `https://your-domain.com/news/${params.slug}`,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [{ url: '/images/placeholder.jpg' }],
    },
  };
}

// Rest of the code remains the same...

// Fetch post by slug
async function getPostBySlug(slug: string): Promise<NewsPost | null> {
  try {
    console.log(`Fetching post with slug: ${slug}`);
    const docRef = doc(db, 'blogs', slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`Post with slug ${slug} not found`);
      return null;
    }

    const data = docSnap.data();
    let formattedDate: Date | string = 'Unknown date';
    if (data.createdAt) {
      try {
        formattedDate = data.createdAt.toDate?.() || new Date(data.createdAt);
      } catch (e) {
        console.warn(`Date formatting error for post ${docSnap.id}:`, e);
      }
    }

    return {
      id: docSnap.id,
      title: data.title ?? 'Untitled Post',
      content: data.content ?? 'No content available',
      author: data.author ?? 'Anonymous',
      createdAt: formattedDate,
      imageUrl: data.imageUrl,
      categories: data.categories ?? 'Uncategorized',
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export const revalidate = 3600; // Optional: ISR