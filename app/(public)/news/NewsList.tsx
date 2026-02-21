"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from './page';

interface BlogListProps {
  posts: Post[];
  error: Error | null;
}

// Extract components for better organization and reusability
const ErrorMessage = () => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load blog posts</h2>
    <p className="text-gray-700">We're experiencing technical difficulties. Please try again later.</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center text-gray-600 text-lg py-10">
    <p>No blog posts found. Check back soon!</p>
  </div>
);

const BlogHeader = () => (
  <div className="relative w-full bg-blue-600 text-white bg-cover bg-center" 
       style={{ backgroundImage: "url('/images/box.jpg')" }}>
    {/* Add overlay for better text readability */}
    <div className="absolute inset-0 bg-black opacity-40"></div>
    
    <div className="container mx-auto text-center max-w-6xl py-24 px-6 relative z-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
        OUR NEWS FEEDS
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100">
        Our Out-Reach every step of the way
      </p>
    </div>
  </div>
);

const BlogCard = ({ post }: { post: Post }) => {
  const formattedDate = post.createdAt instanceof Date 
    ? post.createdAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : post.createdAt;

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 sm:h-56 w-full">
        <Image
          src={post.imageUrl || '/images/placeholder.jpg'}
          alt={post.title || "Blog post thumbnail"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
          }}
          priority={false}
        />
      </div>
      <div className="p-6 space-y-4 flex-grow">
        <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        {post.categories && (
          <div className="flex flex-wrap gap-2">
            {post.categories.split(',').map((category, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {category.trim()}
              </span>
            ))}
          </div>
        )}
        <p className="text-gray-500 text-sm">
          Posted on {formattedDate}
        </p>
        <p className="text-gray-600 line-clamp-3">
          {(() => {
            const text = post.content.startsWith("<")
              ? post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
              : post.content;
            return text.length > 150 ? `${text.substring(0, 150)}...` : text;
          })()}
        </p>
        <p className="text-gray-500 text-sm">By {post.author || 'Anonymous'}</p>
      </div>
      <div className="px-6 pb-6">
        <Link
          href={`/news/${post.id}`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md w-full text-center"
          aria-label={`Read more about ${post.title}`}
        >
          Read More
        </Link>
      </div>
    </article>
  );
};

export default function BlogList({ posts, error }: BlogListProps) {
  // Handle error state
  if (error) {
    return (
      <main>
        <BlogHeader />
        <div className="container mx-auto max-w-6xl py-12 px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Our Blog
          </h1>
          <ErrorMessage />
        </div>
      </main>
    );
  }

  return (
    <main>
      <BlogHeader />
      
      <div className="bg-gray-50 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Our Blog
          </h1>
          
          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {/* Add pagination if needed */}
          {posts.length > 0 && (
            <div className="mt-16 flex justify-center">
              <nav aria-label="Blog pagination" className="inline-flex">
                <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-l-md">
                  Previous
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
                  1
                </button>
                <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium">
                  2
                </button>
                <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-r-md">
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}