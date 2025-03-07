import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { z } from "zod";
// Define validation schema
const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type for the validated request data
type LoginRequest = z.infer<typeof loginSchema>;

// Type for the success response
interface LoginResponse {
    message: string;
    user: {
        uid: string;
        email: string | null;
        emailVerified: boolean;
        createdAt: string | undefined;
        lastLoginAt: string | undefined;
    };
}

// Type for error response
interface ErrorResponse {
    error: string;
    details?: z.ZodIssue[];
}

export async function POST(request: Request): Promise<Response> {
    // Create headers with default values
    const headers = new Headers({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '4',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
    });

    try {
        // Parse and validate request body
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: result.error.issues 
            } satisfies ErrorResponse, { 
                status: 400,
                headers 
            });
        }

        const { email, password } = result.data;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const response: LoginResponse = {
                message: "Login successful",
                user: {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    createdAt: user.metadata.creationTime,
                    lastLoginAt: user.metadata.lastSignInTime,
                }
            };
            
            return NextResponse.json(response, { headers });

        } catch (error) {
            // Handle specific Firebase auth errors
            const firebaseError = error as AuthError;
            const errorMessage = getFirebaseErrorMessage(firebaseError.code);
            
            return NextResponse.json({ 
                error: errorMessage 
            } satisfies ErrorResponse, { 
                status: 401,
                headers 
            });
        }

    } catch (error) {
        console.error("Error in auth route:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        } satisfies ErrorResponse, { 
            status: 500,
            headers 
        });
    }
}

// Firebase error codes type
type FirebaseErrorCode = 
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/user-disabled'
    | 'auth/invalid-email'
    | 'auth/too-many-requests'
    | string;

// Helper function to translate Firebase error codes
function getFirebaseErrorMessage(errorCode: FirebaseErrorCode): string {
    const errorMessages: Record<FirebaseErrorCode, string> = {
        'auth/user-not-found': 'No user found with this email',
        'auth/wrong-password': 'Invalid password',
        'auth/user-disabled': 'This account has been disabled',
        'auth/invalid-email': 'Invalid email address',
        'auth/too-many-requests': 'Too many failed login attempts. Please try again later',
    };

    return errorMessages[errorCode] || 'Authentication failed';
}