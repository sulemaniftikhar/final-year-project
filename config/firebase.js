const admin = require('firebase-admin');

// We use environment variables for the Firebase Admin SDK configuration.
// In production, you would typically use a service account JSON file.
// For now, if the env variables are present, we initialize it using them.

let isInitialized = false;

try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle escaped newlines in the private key from .env
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin SDK initialized successfully.');
        isInitialized = true;
    } else {
        // We don't crash the server if Firebase isn't set up yet, 
        // to allow the server to start while the user is configuring it.
        console.warn('Firebase Admin SDK config is missing in .env. Auth routes will fail.');
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

module.exports = { admin, isInitialized };
