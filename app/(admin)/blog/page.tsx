"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";

const BlogEditor = dynamic(
  () => import("@/components/blog/BlogEditor").then((mod) => mod.default),
  { ssr: false }
);

function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function hasMeaningfulContent(html: string): boolean {
  return stripHtml(html).trim().length > 0;
}
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import axios from "axios";

interface BlogFormState {
  title: string;
  content: string;
  author: string;
  categories: string;
  date: string;
  imageFile: File | null;
  imagePreview: string | null;
}

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

const INITIAL_BLOG_STATE: BlogFormState = {
  title: "",
  content: "",
  author: "",
  categories: "",
  date: new Date().toISOString().split("T")[0],
  imageFile: null,
  imagePreview: null,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadImageToCloudinary = async (file: File) => {
  try {
    const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloud_name || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing or incomplete.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const apiUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
    const response = await axios.post(apiUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });

    if (!response.data.secure_url) {
      throw new Error("Cloudinary upload failed - no secure URL returned");
    }

    return response.data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Image upload failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw new Error(
      `Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

interface ImagePickerProps {
  onImageSelect: (file: File) => void;
  currentImage: string | null;
  onRemoveImage: () => void;
  isEditing: boolean;
}

const ImagePicker = ({
  onImageSelect,
  currentImage,
  onRemoveImage,
  isEditing,
}: ImagePickerProps) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`File ${file.name} exceeds 5MB limit.`);
        return;
      }
      
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Blog Image (max 5MB)
      </label>

      {currentImage && (
        <div className="relative w-40 h-40">
          <img
            src={currentImage}
            alt="Blog image"
            className="w-full h-full object-cover rounded"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            aria-label="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!currentImage && (
        <div className="relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-400">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="w-10 h-10 mx-auto text-gray-400" />
            <div className="text-gray-600">
              <p className="font-medium">Click to upload image</p>
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
  const [newBlog, setNewBlog] = useState<BlogFormState>(INITIAL_BLOG_STATE);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{
    isOpen: boolean;
    blogId: string | null;
    blogTitle: string;
  }>({
    isOpen: false,
    blogId: null,
    blogTitle: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "blogs"), orderBy("createdAt", "desc"))
      );
      const fetchedBlogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Blog[];
      setBlogs(fetchedBlogs);
      setError(null);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to fetch blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleImageSelect = useCallback((file: File) => {
    setError(null);
    if (newBlog.imagePreview && newBlog.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(newBlog.imagePreview);
    }
    
    setNewBlog((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }, [newBlog.imagePreview]);

  const handleRemoveImage = useCallback(() => {
    if (newBlog.imagePreview && newBlog.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(newBlog.imagePreview);
    }
    
    setNewBlog((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
  }, [newBlog.imagePreview]);

  useEffect(() => {
    return () => {
      if (newBlog.imagePreview && newBlog.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(newBlog.imagePreview);
      }
    };
  }, [newBlog.imagePreview]);

  const handleEdit = useCallback((blog: Blog) => {
    setNewBlog({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      categories: blog.categories,
      date: blog.date,
      imageFile: null,
      imagePreview: blog.imageUrl,
    });
    setCurrentBlogId(blog.id);
    setIsEditing(true);
    setIsCreating(true);
  }, []);

  const resetForm = useCallback(() => {
    if (newBlog.imagePreview && newBlog.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(newBlog.imagePreview);
    }
    
    setIsCreating(false);
    setIsEditing(false);
    setCurrentBlogId(null);
    setNewBlog(INITIAL_BLOG_STATE);
    setError(null);
  }, [newBlog.imagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!newBlog.title || !hasMeaningfulContent(newBlog.content) || !newBlog.author || !newBlog.categories) {
        throw new Error("Please fill in all required fields");
      }

      let imageUrl = isEditing && newBlog.imagePreview && !newBlog.imagePreview.startsWith("blob:")
        ? newBlog.imagePreview
        : null;

      if (newBlog.imageFile) {
        imageUrl = await uploadImageToCloudinary(newBlog.imageFile);
      }

      const blogData = {
        title: newBlog.title.trim(),
        content: newBlog.content.trim(),
        author: newBlog.author.trim(),
        categories: newBlog.categories.trim(),
        date: newBlog.date,
        imageUrl,
        createdAt: isEditing
          ? blogs.find((b) => b.id === currentBlogId)?.createdAt
          : Timestamp.now(),
      };
      if (isEditing && currentBlogId) {
        const response = await fetch(`/api/blog/${currentBlogId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogData),
        });
  
        const responseBody = await response.text();
        if (!response.ok) {
          let errorMessage = `Failed to update blog: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseBody);
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {}
          throw new Error(errorMessage);
        }
  
        const updatedBlog = JSON.parse(responseBody);
        setBlogs((prev) =>
          prev.map((blog) => (blog.id === currentBlogId ? updatedBlog : blog))
        );
      } else {
        const response = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogData),
        });
  
        const responseBody = await response.text();
        if (!response.ok) {
          let errorMessage = `Failed to create blog: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseBody);
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {}
          throw new Error(errorMessage);
        }
  
        const newBlogData = JSON.parse(responseBody);
        setBlogs((prev) => [newBlogData, ...prev]);
      }
  
      resetForm();
    } catch (error) {
      console.error("Error saving blog:", error);
      setError(error instanceof Error ? error.message : "Failed to save blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBlog = async () => {
    if (!deleteModalData.blogId) return;
    setIsDeleting(true);
    setError(null);
  
    try {
      const response = await fetch(`/api/blog/${deleteModalData.blogId}`, {
        method: "DELETE",
      });
  
      const responseBody = await response.text();
      if (!response.ok) {
        let errorMessage = `Failed to delete blog: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseBody);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {}
        throw new Error(errorMessage);
      }
  
      setBlogs((prev) =>
        prev.filter((blog) => blog.id !== deleteModalData.blogId)
      );
      setDeleteModalData({ isOpen: false, blogId: null, blogTitle: "" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      setError(error instanceof Error ? error.message : "Failed to delete blog");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((blog) =>
        [blog.title, blog.author, blog.categories]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [blogs, searchTerm]
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Blogs</h1>

      <div className="flex justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title, author or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow max-w-xl p-2 border rounded"
        />
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(false);
            setNewBlog(INITIAL_BLOG_STATE);
          }}
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {isEditing ? "Edit Blog" : "Create Blog"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      placeholder="Enter blog title"
                      value={newBlog.title}
                      onChange={(e) =>
                        setNewBlog((prev) => ({ ...prev, title: e.target.value }))
                      }
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <BlogEditor
                      value={newBlog.content}
                      onChange={(html) =>
                        setNewBlog((prev) => ({ ...prev, content: html }))
                      }
                      placeholder="Write your blog content"
                      minHeight="250px"
                    />
                  </div>

                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      id="author"
                      name="author"
                      placeholder="Enter author name"
                      value={newBlog.author}
                      onChange={(e) =>
                        setNewBlog((prev) => ({ ...prev, author: e.target.value }))
                      }
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={newBlog.date}
                      onChange={(e) =>
                        setNewBlog((prev) => ({ ...prev, date: e.target.value }))
                      }
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <input
                      id="categories"
                      name="categories"
                      placeholder="Enter categories (comma-separated)"
                      value={newBlog.categories}
                      onChange={(e) =>
                        setNewBlog((prev) => ({ ...prev, categories: e.target.value }))
                      }
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <ImagePicker
                      onImageSelect={handleImageSelect}
                      currentImage={newBlog.imagePreview}
                      onRemoveImage={handleRemoveImage}
                      isEditing={isEditing}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
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
                    ) : isEditing ? (
                      "Update Blog"
                    ) : (
                      "Save Blog"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteModalData.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Delete Blog</h2>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModalData({ isOpen: false, blogId: null, blogTitle: "" })
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="mb-4">
                Are you sure you want to delete "
                <span className="font-semibold">{deleteModalData.blogTitle}</span>"?
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModalData({ isOpen: false, blogId: null, blogTitle: "" })
                  }
                  disabled={isDeleting}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteBlog}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading blogs...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredBlogs.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No blogs found. {blogs.length === 0 ? "Try creating one!" : "Try adjusting your search."}
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog, index) => (
                  <tr key={blog.id}>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                      {blog.imageUrl ? (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">No Image</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blog.title}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm text-gray-500 line-clamp-2">{stripHtml(blog.content)}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">{blog.author}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.date).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(blog)}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteModalData({
                              isOpen: true,
                              blogId: blog.id,
                              blogTitle: blog.title,
                            })
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPage;