// app/blog/[slug]/NewsPostView.tsx (Client Component)
"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NewsPost } from './page';

interface NewsPostViewProps {
  post: NewsPost;
}

export default function NewsPostView({ post }: NewsPostViewProps) {
  return (
    <main className="bg-gray-50 py-12 px-6">
      {/* Optional Header for consistency with list view */}
      <div className="relative w-full bg-blue-600 text-white bg-cover bg-center mb-12" 
          style={{ backgroundImage: post.imageUrl ? `url('${post.imageUrl}')` : "url('/images/box.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="container mx-auto max-w-4xl py-20 px-6 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            {post.title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          {/* Post content */}
          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
              <Link href="/news" className="hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to blog
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories && post.categories.split(',').map((category, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {category.trim()}
                </span>
              ))}
            </div>
            
            <div className="flex items-center mb-8">
              <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-gray-600 mr-3">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-gray-800 font-medium">{post.author}</p>
                <p className="text-gray-500 text-sm">
                  {post.createdAt instanceof Date 
                    ? post.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) 
                    : post.createdAt}
                </p>
              </div>
            </div>

            {/* Blog content - supports HTML (from Draft.js) or legacy plain text */}
            <div className="prose prose-lg max-w-none">
              {post.content.trim().startsWith("<") ? (
                <div
                  className="blog-content [&_p]:mb-6 [&_p]:text-gray-700 [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Link 
            href="/news" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-all duration-300 hover:shadow-md"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    </main>
  );
}