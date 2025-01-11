'use client';

import { useEffect, useState } from 'react';

export default function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newBlog, setNewBlog] = useState({ title: '', content: '', author: '', categories: '', date: '', imageUrl: null });
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all blogs from the API
    const fetchBlogs = async () => {
        try {
            const response = await fetch('/api/blog');
            if (!response.ok) throw new Error('Failed to fetch blogs');
            const data = await response.json();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Failed to fetch blogs. Please try again later.');
        }
    };

    // Create a new blog entry
    const createBlog = async () => {
        try {
            const formData = new FormData();
            formData.append('title', newBlog.title);
            formData.append('content', newBlog.content);
            formData.append('author', newBlog.author);
            formData.append('categories', newBlog.categories);
            formData.append('date', newBlog.date);
            if (newBlog.imageUrl) {
                formData.append('image', newBlog.imageUrl);
            }

            const response = await fetch('/api/blog', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to create blog');
            setNewBlog({ title: '', content: '', author: '', categories: '', date: '', imageUrl: null });
            fetchBlogs();
            setIsCreating(false);
        } catch (error) {
            console.error('Error creating blog:', error);
            setError('Failed to create blog. Please check your inputs and try again.');
        }
    };

    // Delete a blog by ID
    const deleteBlog = async (id) => {
        try {
            const response = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete blog');
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting blog:', error);
            setError('Failed to delete blog. Please try again later.');
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Filter blogs based on search term
    const filteredBlogs = blogs.filter(
        (blog) =>
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Manage Blogs</h1>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search by title or author"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
            />

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Create Blog Button */}
            <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Create New Blog
            </button>

            {/* Blog Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-white-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
                        <h2 className="text-xl font-bold">Create Blog</h2>
                        <input
                            placeholder="Title"
                            value={newBlog.title}
                            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <textarea
                            placeholder="Content"
                            value={newBlog.content}
                            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                            className="w-full p-2 border rounded h-32"
                            style={{ resize: 'vertical' }}
                        ></textarea>
                        <input
                            placeholder="Author"
                            value={newBlog.author}
                            onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            placeholder="Categories"
                            value={newBlog.categories}
                            onChange={(e) => setNewBlog({ ...newBlog, categories: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="date"
                            value={newBlog.date}
                            onChange={(e) => setNewBlog({ ...newBlog, date: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <label className="w-full p-2 border rounded block text-gray-700">
                            <span>Select an image (max size: 2MB)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && file.size > 2 * 1024 * 1024) {
                                        setError('Image size exceeds 2MB. Please choose a smaller file.');
                                    } else {
                                        setNewBlog({ ...newBlog, imageUrl: file });
                                        setError(null);
                                    }
                                }}
                                className="mt-2"
                            />
                        </label>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createBlog}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Blog List */}
            <ul className="space-y-4">
                {blogs.length === 0 ? (
                    <p className="text-gray-600">No blogs available. Try creating one!</p>
                ) : (
                    filteredBlogs.map((blog) => (
                        <li key={blog._id} className="border p-4 rounded space-y-2">
                            {blog.imageUrl && (
                                <img
                                    src={URL.createObjectURL(blog.imageUrl)}
                                    alt={blog.title}
                                    className="w-full h-48 object-cover rounded"
                                />
                            )}
                            <h3 className="text-xl font-bold">{blog.title}</h3>
                            <p className="text-gray-600">Author: {blog.author}</p>
                            <p className="text-gray-600">Categories: {blog.categories}</p>
                            <p className="text-gray-600">Date: {new Date(blog.date).toLocaleDateString()}</p>
                            <p>{blog.content}</p>
                            <button
                                onClick={() => deleteBlog(blog._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
