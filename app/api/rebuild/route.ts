import { NextResponse } from 'next/server';
var admin = require("firebase-admin");

// Initialize Firebase Admin SDK
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

export async function POST(request: Request) {
    const authorization = request.headers.get('Authorization');

    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];

        try {
            // Verify the ID token
            await admin.auth().verifyIdToken(idToken);

            // Token is valid, now trigger the rebuild
            const rebuildUrl = process.env.REBUILD_WEBHOOK_URL;
            if (!rebuildUrl) {
                console.error("Rebuild webhook URL is not configured.");
                return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
            }

            const rebuildResponse = await fetch(rebuildUrl, { method: 'POST' });
            if (!rebuildResponse.ok) {
                console.error("Failed to trigger rebuild:", await rebuildResponse.text());
                return NextResponse.json({ success: false, message: 'Failed to trigger rebuild.' }, { status: 500 });
            }

            return NextResponse.json({ success: true, message: 'Rebuild triggered successfully.' });

        } catch (error) {
            console.error("Error verifying auth token:", error);
            return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
        }
    } else {
        return NextResponse.json({ success: false, message: 'No authorization token provided.' }, { status: 401 });
    }
} 