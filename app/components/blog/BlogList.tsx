"use client"

import { useState, useEffect } from 'react'
import { BlogList } from '@/app/components/bloglist'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (!response.ok) throw new Error('Failed to fetch posts')
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete a post
  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete post')
      
      // Remove the deleted post from state
      setPosts(posts.filter(post => post.id !== postId))
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle edit post
  const handleEdit = async (post) => {
    // Navigate to edit page or open edit modal
    // This is a placeholder - implement based on your app's navigation strategy
    console.log('Edit post:', post)
  }

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <BlogList 
        posts={posts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}