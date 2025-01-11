import { NextResponse } from 'next/server';

// In a real application, this would be your database
let posts = [
  {
    id: 1,
    title: 'First Post',
    content: 'This is the first post content.',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newPost = {
    id: posts.length + 1,
    ...body,
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  return NextResponse.json(newPost, { status: 201 });
}
