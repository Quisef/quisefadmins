// app/blog/BlogList.tsx (Client Component)
"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from './page';

interface NewsListProps {
  posts: Post[];
  error: Error | null;
}

export default function NewsList({ posts, error }: NewsListProps) {
  // Handle error state
  if (error) {
    return (
      <main className="bg-gray-50 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Our Blog
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load blog posts</h2>
            <p className="text-gray-700">We're experiencing technical difficulties. Please try again later.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-12 px-6">
        <section className="relative bg-blue-600 text-white py-16 px-6 text-center bg-cover bg-center" style={{ backgroundImage: "url('/images/box.jpg')" }}>
            <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
                        OUR NEWS FEEDS
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100">
                Our Out-Reach evert step of the way
            </p>
            
            </div>
        </section>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
          Our Blog
        </h1>
        {posts.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            No blog posts found. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                {post.imageUrl ? (
                  <div className="relative h-48 sm:h-56 w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 sm:h-56 w-full bg-gray-200" />
                )}
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
                  <div className="text-gray-600 text-sm">{post.categories}</div>
                  <p className="text-gray-600 text-sm">
                    Posted on {post.createdAt instanceof Date ? post.createdAt.toLocaleDateString() : post.createdAt}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </p>
                  <p className="text-gray-500 text-sm">By {post.author}</p>
                  <Link
                    href={`/NewsPostView/${post.id}`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}