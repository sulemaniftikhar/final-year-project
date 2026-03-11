import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import api from '../../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Firebase user
    const [profile, setProfile] = useState(null); // Backend DB profile
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (firebaseUser) => {
        try {
            const token = await firebaseUser.getIdToken(true);
            const response = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.data || response.data?.user || null;
            console.log('[AuthContext] Profile fetched:', data?.fullName || data?.email);
            setProfile(data);
            return data;
        } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error.response?.status, error.message);

            // Only sign out if 401 AND this is definitely a ghost account
            // (user exists in Firebase but not in DB)
            if (error.response?.status === 401) {
                console.warn('[AuthContext] User not found in DB. They may need to re-register.');
                // DON'T auto-signOut — let the user stay "logged in" at Firebase level
                // so they can see the dashboard and be prompted to complete registration if needed
            }
            setProfile(null);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('[AuthContext] onAuthStateChanged:', firebaseUser ? firebaseUser.email : 'null');
            setUser(firebaseUser);

            if (firebaseUser) {
                await fetchProfile(firebaseUser);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const checkAuth = async () => {
        if (user) {
            return await fetchProfile(user);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
        }
    };

    const value = {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        isRestaurantOwner: profile?.role === 'RESTAURANT_OWNER',
        isAdmin: profile?.role === 'ADMIN',
        checkAuth,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
