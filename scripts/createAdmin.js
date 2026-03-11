/**
 * Admin User Creation Script
 * ===========================
 * Run this ONCE to create an admin account in Firebase + database.
 *
 * Usage:
 *   node backend/scripts/createAdmin.js
 */

const path = require('path');
const fs = require('fs');

// Try to find .env in backend/ or root/
const backendEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(backendEnvPath)) {
    require('dotenv').config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
    require('dotenv').config({ path: rootEnvPath });
} else {
    console.warn("⚠️ No .env file found. Proceeding with existing environment variables.");
}

const admin = require('firebase-admin');

// We use the db from the backend
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Configure these as desired ----
const ADMIN_EMAIL = 'admin@orderiq.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_FULL_NAME = 'OrderIQ Admin';
// ------------------------------------

async function initFirebase() {
    if (admin.apps.length === 0) {
        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error("❌ Missing FIREBASE_PROJECT_ID in .env!");
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
}

async function createAdmin() {
    try {
        await initFirebase();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }

    console.log('Creating admin user...');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('');

    // 1. Create or get Firebase user
    let firebaseUser;
    try {
        firebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        console.log('✓ Firebase user already exists, reusing it');
    } catch {
        try {
            firebaseUser = await admin.auth().createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                displayName: ADMIN_FULL_NAME,
                emailVerified: true,
            });
            console.log('✓ Firebase user created in auth');
        } catch (createUserErr) {
            console.error('❌ Failed to create Firebase user:', createUserErr.message);
            process.exit(1);
        }
    }

    // 2. Upsert database user with ADMIN role
    try {
        await prisma.user.upsert({
            where: { firebaseUid: firebaseUser.uid },
            update: { role: 'ADMIN', fullName: ADMIN_FULL_NAME },
            create: {
                firebaseUid: firebaseUser.uid,
                email: ADMIN_EMAIL,
                fullName: ADMIN_FULL_NAME,
                role: 'ADMIN',
            },
        });
        console.log('✓ Database user created/updated with ADMIN role');
    } catch (dbErr) {
        console.error('❌ Failed to save user in database:', dbErr.message);
        process.exit(1);
    }

    console.log('');
    console.log('===========================================');
    console.log('Admin account ready!');
    console.log(`  URL:      http://localhost:5173/admin/login`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('===========================================');

    await prisma.$disconnect();
}

createAdmin().catch(err => {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
});
