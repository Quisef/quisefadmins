// app/blog/[slug]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-gray-50 py-16 px-6 min-h-screen flex items-center">
      <div className="container mx-auto max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Blog Post Not Found</h2>
        <p className="text-gray-600 mb-8">We couldn't find the blog post you're looking for.</p>
        <Link
          href="/blog"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-all duration-300 hover:shadow-md"
        >
          Return to Blog
        </Link>
      </div>
    </main>
  );
}