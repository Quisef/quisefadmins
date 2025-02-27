// app/blog/page.tsx (Server Component)
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import NewsList from './NewsList';

export const metadata: Metadata = {
  title: 'Blog - QuietShelter Empowerment Foundation',
  description: 'Read the latest updates and insights from QuietShelter Empowerment Foundation.',
  openGraph: {
    title: 'Blog - QuietShelter Empowerment Foundation',
    description: 'Read the latest updates and insights from QuietShelter Empowerment Foundation.',
    url: 'https://your-domain.com/blog',
    images: ['/images/placeholder.jpg'],
  },
};

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

// Server component that fetches data
export default async function NewsPage() {
  let posts: Post[] = [];
  let error: Error | null = null;

  try {
    console.log("Fetching posts from 'blogs' collection...");
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    console.log("Query completed, documents returned:", querySnapshot.size);

    if (!querySnapshot.empty) {
      posts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let formattedDate: Date | string;

        try {
          formattedDate = data.createdAt
            ? data.createdAt.toDate
              ? data.createdAt.toDate()
              : new Date(data.createdAt)
            : 'Unknown date';
        } catch (e) {
          console.warn(`Date formatting error for post ${doc.id}`, e);
          formattedDate = 'Unknown date';
        }

        return {
          id: doc.id,
          title: data.title || 'Untitled Post',
          content: data.content || 'No content available',
          author: data.author || 'Anonymous',
          createdAt: formattedDate,
          imageUrl: data.imageUrl || undefined,
          categories: data.categories || 'Uncategorized',
        };
      });
    }
  } catch (err) {
    console.error('Error fetching posts:', err);
    error = err instanceof Error ? err : new Error('Unknown error occurred');
  }

  return <NewsList posts={posts} error={error} />;
}