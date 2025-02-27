import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps } from "firebase-admin/app";
import admin from "firebase-admin"; // Import admin for credential access

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is missing");
  }

  let parsedServiceAccount;
  try {
    parsedServiceAccount = JSON.parse(serviceAccount);
  } catch (parseError) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", parseError);
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not a valid JSON string");
  }

  if (!getApps().length) {
    initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
    });
  }

export async function POST(request: Request) {
  try {
    // Extract UID from request body (you'll call this API with a UID)
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: "User UID is required" }, { status: 400 });
    }

    // Optional: Add authentication to protect this endpoint
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "No authentication token provided" }, { status: 401 });
    }
    const user = await getAuth().verifyIdToken(token);
    if (!user || user.customClaims?.role !== "superadmin") { // Example: restrict to superadmins
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Set admin role for the specified user
    await getAuth().setCustomUserClaims(uid, { role: "admin" });

    console.log(`Admin role set for user ${uid}`);
    return NextResponse.json({ message: `Admin role set for user ${uid}` }, { status: 200 });
  } catch (error) {
    console.error("Error setting admin role:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to set admin role" },
      { status: 500 }
    );
  }
}