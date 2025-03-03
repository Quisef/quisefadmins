// app/api/blog/[blogID]/route.tsx
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: Request, { params }: { params: { blogID: string } }) {
  try {
    const body = await request.json();
    const requiredFields = ["title", "content", "author"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
      }
    }

    const blogRef = doc(db, "blogs", params.blogID);
    const blogDoc = await getDoc(blogRef);
    if (!blogDoc.exists()) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const { id, createdAt, ...updateData } = body;
    await updateDoc(blogRef, { ...updateData, updatedAt: new Date().toISOString() });
    const updatedBlog = await getDoc(blogRef);
    return NextResponse.json({ id: updatedBlog.id, ...updatedBlog.data() });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: {  blogID: string } }) {
  try {
    const blogRef = doc(db, "blogs", params. blogID);
    const blogDoc = await getDoc(blogRef);
    if (!blogDoc.exists()) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const blogData = blogDoc.data();
    if (blogData.imageUrl) {
      const publicId = blogData.imageUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
      }
    }

    await deleteDoc(blogRef);
    return NextResponse.json({ message: "Blog deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete blog" },
      { status: 500 }
    );
  }
}