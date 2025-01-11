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
  };