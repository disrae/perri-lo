import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
var admin = require("firebase-admin");
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK (reuse from rebuild route)
if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountKey) {
        // For production (e.g., Vercel), where the service account key is base64 encoded.
        const decodedJson = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decodedJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
    // else {
    //     // For local development, try to read from local file first
    //     try {
    //         const localKeyPath = path.join(process.cwd(), 'keys', 'firebase_service_key');
    //         if (fs.existsSync(localKeyPath)) {
    //             const base64Content = fs.readFileSync(localKeyPath, 'utf8').trim();
    //             const decodedJson = Buffer.from(base64Content, 'base64').toString('utf8');
    //             const serviceAccount = JSON.parse(decodedJson);
    //             admin.initializeApp({
    //                 credential: admin.credential.cert(serviceAccount),
    //                 databaseURL: process.env.FIREBASE_DATABASE_URL
    //             });
    //         } else {
    //             // Fall back to GOOGLE_APPLICATION_CREDENTIALS
    //             admin.initializeApp({
    //                 databaseURL: process.env.FIREBASE_DATABASE_URL
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error loading local Firebase credentials:', error);
    //         // Fall back to GOOGLE_APPLICATION_CREDENTIALS
    //         admin.initializeApp({
    //             databaseURL: process.env.FIREBASE_DATABASE_URL
    //         });
    //     }
    // }
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

        // Generate password reset link using Firebase Admin SDK
        // Note: This generates the link but doesn't send email - for actual email sending,
        // you would need to integrate with an email service like SendGrid, Mailgun, etc.
        try {
            const auth = getAuth();
            const actionCodeSettings = {
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin`,
                handleCodeInApp: false,
            };

            const resetLink = await auth.generatePasswordResetLink(email, actionCodeSettings);
            console.log('Password reset link generated successfully:', resetLink);

            // TODO: Send the resetLink via your email service (SendGrid, Mailgun, etc.)
            // Example: await sendEmail(email, 'Password Reset', `Reset your password: ${resetLink}`);

            return NextResponse.json({
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent.'
            });
        } catch (error: any) {
            console.log('Password reset link generation error:', error.code, error.message);

            // For security, we return the same success message even if there was an error
            // This prevents user enumeration attacks
            return NextResponse.json({
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to process password reset request. Please try again.'
        }, { status: 500 });
    }
}