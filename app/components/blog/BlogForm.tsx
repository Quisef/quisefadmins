"use client"
import React, { useState } from "react";

interface Post {
  id?: string;
  title: string;
  content: string;
}

interface BlogFormProps {
  post?: Post;
  onClose: () => void;
  onSave: () => void;
}

export const BlogForm: React.FC<BlogFormProps> = ({ post, onClose, onSave }) => {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const method = post ? 'PUT' : 'POST';
      const url = post ? `/api/blogs/${post.id}` : '/api/blogs';
    
      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title, 
            content,
            author: "Default Author", // Add author field or collect from form
            categories: "Default",    // Add categories input in form
            date: new Date().toISOString()
          }),
        });
        if (!response.ok) throw new Error('Failed to save');
        onSave();
      } catch (error) {
        console.error('Error saving post:', error);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {post ? 'Update' : 'Create'} Post
          </button>
        </div>
      </form>
    );
  };