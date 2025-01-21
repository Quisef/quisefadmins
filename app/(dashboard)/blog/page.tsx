"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import Image from "next/image";
import axios from "axios";

interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string;
  date: string;
  imageUrl: string | null;
  createdAt: Timestamp;
}

const INITIAL_BLOG_STATE = {
  title: "",
  content: "",
  author: "",
  categories: "",
  date: new Date().toISOString().split("T")[0],
  imageUrl: null,
  imagePreview: null,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Cloudinary Upload Function
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );
  return response.data.secure_url;
};

const ImagePicker = ({ onImageSelect, currentImage, onRemoveImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file.size > MAX_IMAGE_SIZE) {
      alert("File size exceeds 5MB limit.");
      return;
    }
    onImageSelect(file);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) handleFile(files[0]);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Blog Image (max 5MB)</label>
      {currentImage ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
          <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
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
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="w-10 h-10 mx-auto text-gray-400" />
            <div className="text-gray-600">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm">SVG, PNG, JPG, or GIF (max. 5MB)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBlog, setNewBlog] = useState(INITIAL_BLOG_STATE);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlogs = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
      setBlogs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Blog[]);
    } catch {
      setError("Failed to fetch blogs");
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleImageSelect = (file) => {
    setNewBlog((prev) => ({
      ...prev,
      imageUrl: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveImage = () => {
    setNewBlog((prev) => ({ ...prev, imageUrl: null, imagePreview: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let uploadedImageUrl = null;
      if (newBlog.imageUrl) {
        uploadedImageUrl = await uploadImageToCloudinary(newBlog.imageUrl);
      }

      const blogData = {
        ...newBlog,
        imageUrl: uploadedImageUrl,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "blogs"), blogData);
      setBlogs((prev) => [{ id: docRef.id, ...blogData }, ...prev]);
      setNewBlog(INITIAL_BLOG_STATE);
      setIsCreating(false);
    } catch {
      setError("Failed to create blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((blog) =>
        [blog.title, blog.author]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [blogs, searchTerm]
  );

  // ... rest of your component JSX remains similar, just update the blog card to use new structure ...
  return (
    <div className="container mx-auto p-4">
      {/* ... existing JSX ... */}
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
          <div key={blog.id} className="border rounded-lg p-4 space-y-4">
            {blog.imageUrl && (
              <div className="relative w-full h-48">
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  width={500}
                  height={300}
                  className="object-cover rounded"
                />
              </div>
            )}
            <h3 className="text-xl font-semibold">{blog.title}</h3>
            <div className="space-y-1 text-sm text-gray-500">
              <p>Author: {blog.author}</p>
              <p>Categories: {blog.categories}</p>
              <p>Date: {new Date(blog.date).toLocaleDateString()}</p>
            </div>
            <p className="line-clamp-3">{blog.content}</p>
            <button
              onClick={() => deleteBlog(blog.id, blog.imageUrl)}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ... rest of your component JSX ... */}
      {filteredBlogs.length === 0 && (
        <p className="text-center text-gray-500">
          No blogs found. {blogs.length === 0 ? 'Try creating one!' : 'Try adjusting your search.'}
        </p>
      )}
    </div>
  );
};

export default BlogPage;