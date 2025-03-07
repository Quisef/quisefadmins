//app/api/blog/route.tsx
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields = ["title", "content", "author"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const blogData = {
      title: body.title,
      content: body.content,
      author: body.author,
      categories: body.categories || "",
      date: body.date || new Date().toISOString().split("T")[0],
      imageUrl: body.imageUrl || null,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "blogs"), blogData);
    return NextResponse.json({ blogID: docRef.id, ...blogData }, { status: 201 });
  } catch (error) {
    console.error("Blog Creation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create blog" },
      { status: 500 }
    );
  }
}