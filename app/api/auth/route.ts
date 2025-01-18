import { NextResponse } from "next/server";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { z } from "zod";

// Define validation schema
const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: result.error.issues 
            }, { status: 400 });
        }

        

        const { email, password } = result.data;

        // Rate limiting headers
        const headers = new Headers();
        headers.set('X-RateLimit-Limit', '5');
        headers.set('X-RateLimit-Remaining', '4'); // This should be dynamically calculated

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Add security headers
            headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            headers.set('Pragma', 'no-cache');
            
            return NextResponse.json({
                message: "Login successful",
                user: {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    createdAt: user.metadata.creationTime,
                    lastLoginAt: user.metadata.lastSignInTime,
                }
            }, { headers });

        } catch (firebaseError: any) {
            // Handle specific Firebase auth errors
            const errorMessage = getFirebaseErrorMessage(firebaseError.code);
            return NextResponse.json({ error: errorMessage }, { 
                status: 401,
                headers 
            });
        }

    } catch (error: any) {
        console.error("Error in auth route:", error);
        return NextResponse.json({ 
            error: "Internal server error"
        }, { status: 500 });
    }
}

// Helper function to translate Firebase error codes
function getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No user found with this email',
        'auth/wrong-password': 'Invalid password',
        'auth/user-disabled': 'This account has been disabled',
        'auth/invalid-email': 'Invalid email address',
        'auth/too-many-requests': 'Too many failed login attempts. Please try again later',
    };

    return errorMessages[errorCode] || 'Authentication failed';
}