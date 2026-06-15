import api from './api';
import { auth } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { validatePassword } from '../utils/passwordUtils';

/**
 * Register a new user with Firebase and sync to backend
 */
export const registerUser = async (email, password, userData) => {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
    }
    
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
export const loginUser = async (email, password, rememberMe = false) => {
    try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // The backend `GET /auth/me` can be used to load full DB profile
        return userCredential.user;
    } catch (error) {
        console.error("Login error", error);
        throw error;
    }
};

/**
 * Send password reset email with custom redirect URL
 */
export const forgotPassword = async (email) => {
    try {
        const actionCodeSettings = {
            url: window.location.origin + '/reset-password',
            handleCodeInApp: true,
        };
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error) {
        console.error("Forgot password error", error);
        throw error;
    }
};

/**
 * Check if email exists in DB
 */
export const checkEmailExists = async (email) => {
    try {
        const response = await api.post('/auth/check-email', { email });
        return response.data.exists;
    } catch (error) {
        console.error("Check email error", error);
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
