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