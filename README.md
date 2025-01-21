This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
// In a real application, this would be your database
//let posts = [
  //{
    //id: 1,
    //title: 'First Post',
    //content: 'This is the first post content.',
    //createdAt: new Date().toISOString(),
  //},
//];

//export async function GET() {
  //return NextResponse.json(posts);
//}

///export async function POST(request: Request) {
  //const body = await request.json();
  //const newPost = {
    //id: posts.length + 1,
    //...body,
    //createdAt: new Date().toISOString(),
  //};
  //posts.push(newPost);
  //return NextResponse.json(newPost, { status: 201 });
//}




import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await request.json();
  
  const index = posts.findIndex(post => post.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  posts[index] = { ...posts[index], ...body };
  return NextResponse.json(posts[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  posts = posts.filter(post => post.id !== id);
  return NextResponse.json({ success: true });
}



// context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  logout,
  User 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

// Provide default values for all properties
const defaultValue: AuthContextType = {
  user: null,
  loading: true,
  signIn: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null); // Clear user from context
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  

  const value = {
    user,
    loading,
    signIn,
    logout,
  };

  if (loading) {
    // You can return a loading component here if you want
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
//app/component/bloglist
"use client"
import React, { useState } from "react";
export const BlogList = ({ posts, onEdit, onDelete }) => {
    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-gray-600">{post.content}</p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => onEdit(post)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };"use client"
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, Upload, X} from 'lucide-react';
import { db } from '../../lib/firebase';
import { Image } from 'next/image';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const INITIAL_BLOG_STATE = {
  title: '',
  content: '',
  author: '',
  categories: '',
  date: new Date().toISOString().split('T')[0],
  imageUrl: null,
  imagePreview: null,
};

const ImagePicker = ({ onImageSelect, currentImage, onRemoveImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Blog Image (max 2MB)</label>
      {currentImage ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            aria-label="Remove Image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageSelect(file);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="w-10 h-10 mx-auto text-gray-400" />
            <div className="text-gray-600">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm">SVG, PNG, JPG or GIF (max. 2MB)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBlog, setNewBlog] = useState(INITIAL_BLOG_STATE);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filteredBlogs = useMemo(
    () =>
      blogs.filter((blog) =>
        [blog.title, blog.author].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
    [blogs, searchTerm]
  );

  const handleImageSelect = useCallback((file) => {
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size exceeds 2MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBlog((prev) => ({
        ...prev,
        imageUrl: file,
        imagePreview: reader.result,
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setNewBlog((prev) => ({
      ...prev,
      imageUrl: null,
      imagePreview: null,
    }));
  }, []);

  // Fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    const handleRefresh = () => {
      setIsLoading(true);
      // Fetch blogs
      setIsLoading(false);
    };
  
    const handleSubmit = async () => {
      setIsSubmitting(true);
      // Submit logic
      setIsSubmitting(false);
    };
  

    fetchBlogs();
  }, []);

  // Create new blog
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Submit logic
    setIsSubmitting(false);
  
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(newBlog).forEach(key => {
        if (key === 'imageUrl' && newBlog[key]) {
          formData.append('image', newBlog[key]);
        } else if (key !== 'imagePreview') {
          formData.append(key, newBlog[key]);
        }
      });

      const response = await fetch('/api/blogs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create blog');
      
      const createdBlog = await response.json();
      setBlogs(prev => [...prev, createdBlog]);
      setIsCreating(false);
      setNewBlog(INITIAL_BLOG_STATE);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Delete blog
  const deleteBlog = async (blogId) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete blog');
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Blogs</h1>

      <div className="flex justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or author"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow max-w-xl p-2 border rounded"
        />
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 whitespace-nowrap"
        >
          Create New Blog
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Create Blog</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      name="title"
                      placeholder="Enter blog title"
                      value={newBlog.title}
                      onChange={(e) => setNewBlog(prev => ({...prev, title: e.target.value}))}
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      name="content"
                      placeholder="Write your blog content"
                      value={newBlog.content}
                      onChange={(e) => setNewBlog(prev => ({...prev, content: e.target.value}))}
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      name="author"
                      placeholder="Enter author name"
                      value={newBlog.author}
                      onChange={(e) => setNewBlog(prev => ({...prev, author: e.target.value}))}
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newBlog.date}
                      onChange={(e) => setNewBlog(prev => ({...prev, date: e.target.value}))}
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <input
                      name="categories"
                      placeholder="Enter categories (comma-separated)"
                      value={newBlog.categories}
                      onChange={(e) => setNewBlog(prev => ({...prev, categories: e.target.value}))}
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <ImagePicker
                      onImageSelect={handleImageSelect}
                      currentImage={newBlog.imagePreview}
                      onRemoveImage={handleRemoveImage}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      'Save Blog'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBlogs.map((blog) => (
          <div key={blog._id} className="border rounded-lg p-4 space-y-4">
            {blog.imageUrl && (
              <img
                src={blog.imagePreview || URL.createObjectURL(blog.imageUrl)}
                alt={blog.title}
                className="w-full h-48 object-cover rounded"
              />
            )}
            <h3 className="text-xl font-semibold">{blog.title}</h3>
            <div className="space-y-1 text-sm text-gray-500">
              <p>Author: {blog.author}</p>
              <p>Categories: {blog.categories}</p>
              <p>Date: {new Date(blog.date).toLocaleDateString()}</p>
            </div>
            <p className="line-clamp-3">{blog.content}</p>
            <button
              onClick={() => deleteBlog(blog._id)}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <p className="text-center text-gray-500">
          No blogs found. {blogs.length === 0 ? 'Try creating one!' : 'Try adjusting your search.'}
        </p>
      )}
    </div>
  );
};

export default BlogPage;



