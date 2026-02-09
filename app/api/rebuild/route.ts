import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
var admin = require("firebase-admin");

// Initialize Firebase Admin SDK
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
    } else {
        // For local development, try to read from local file first
        try {
            const localKeyPath = path.join(process.cwd(), 'keys', 'firebase_service_key');
            if (fs.existsSync(localKeyPath)) {
                const base64Content = fs.readFileSync(localKeyPath, 'utf8').trim();
                const decodedJson = Buffer.from(base64Content, 'base64').toString('utf8');
                const serviceAccount = JSON.parse(decodedJson);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: process.env.FIREBASE_DATABASE_URL
                });
            } else {
                // Fall back to GOOGLE_APPLICATION_CREDENTIALS
                admin.initializeApp({
                    databaseURL: process.env.FIREBASE_DATABASE_URL
                });
            }
        } catch (error) {
            console.error('Error loading local Firebase credentials:', error);
            // Fall back to GOOGLE_APPLICATION_CREDENTIALS
            admin.initializeApp({
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
        }
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