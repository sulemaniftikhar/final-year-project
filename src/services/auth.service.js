import api from './api';
import { auth } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';

/**
 * Register a new user with Firebase and sync to backend
 */
export const registerUser = async (email, password, userData) => {
    let firebaseUser = null;
    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;

        // Optionally update display name in Firebase
        if (userData.name) {
            await updateProfile(firebaseUser, { displayName: userData.name });
        }

        // Get the Firebase ID token so the interceptor can attach it
        await firebaseUser.getIdToken();

        // 2. Build the payload matching the backend controller's expectations:
        //    { firebaseUid, email, fullName, phone, role }
        const backendPayload = {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: userData.name || userData.fullName,
            phone: userData.phone || '',
            role: userData.role || 'CUSTOMER',
            referralCode: userData.referralCode || '',
        };

        const response = await api.post('/auth/register', backendPayload);

        return { user: firebaseUser, dbUser: response.data.data };
    } catch (error) {
        console.error("Registration error", error);
        // If backend registration fails, delete the Firebase user to keep things in sync
        if (firebaseUser) {
            try { await firebaseUser.delete(); } catch (_) { }
        }
        throw error;
    }
};

/**
 * Login user via Firebase
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // The backend `GET /auth/me` can be used to load full DB profile
        return userCredential.user;
    } catch (error) {
        console.error("Login error", error);
        throw error;
    }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error", error);
        throw error;
    }
};

/**
 * Get current user profile from DB
 */
export const getCurrentUserProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
