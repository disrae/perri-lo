import { NextResponse } from 'next/server';
var admin = require("firebase-admin");

// Initialize Firebase Admin SDK (reuse from rebuild route)
if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountKey) {
        // For production (e.g., Vercel), where the service account key is a JSON string.
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    } else {
        // For local development, where GOOGLE_APPLICATION_CREDENTIALS points to a file.
        // The SDK automatically finds the credentials from the environment variable.
        admin.initializeApp({
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
}

// No whitelist needed - we'll check Firebase Auth directly

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        console.log('Forgot password request for email:', email);

        if (!email) {
            console.log('No email provided');
            return NextResponse.json({
                success: false,
                message: 'Email is required.'
            }, { status: 400 });
        }

        // Check if user exists using Firebase Admin
        console.log('Checking if user exists in Firebase Auth...');
        let userExists = false;
        let userData = null;
        try {
            userData = await admin.auth().getUserByEmail(email);
            userExists = true;
            console.log('User found in Firebase Auth:', userData.uid);
        } catch (error: any) {
            console.log('User check error:', error.code, error.message);
            if (error.code === 'auth/user-not-found') {
                userExists = false;
                console.log('User not found in Firebase Auth');
            } else {
                console.error('Unexpected error checking user:', error);
                throw error;
            }
        }

        if (!userExists) {
            console.log('User does not exist in Firebase Auth');
            return NextResponse.json({
                success: false,
                message: 'If an account with this email exists, a password reset link has been sent.'
            });
        }

        // User exists, return success and let client handle email sending
        console.log('User exists. Returning success to trigger client-side email sending.');
        return NextResponse.json({
            success: true,
            message: 'Password reset email sent successfully.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to send password reset email. Please try again.'
        }, { status: 500 });
    }
}