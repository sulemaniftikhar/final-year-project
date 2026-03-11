import React, { createContext, useContext } from 'react';
import { useAuth } from '../auth/AuthContext';
import { loginUser, logoutUser } from '../../services/auth.service';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    // We defer to the global AuthContext for actual auth state
    const { user, profile, loading, isAuthenticated, isAdmin } = useAuth();

    // Admin is authenticated only if logged in AND has the ADMIN role
    const isAdminAuthenticated = isAuthenticated && isAdmin;

    const adminLogin = async (email, password) => {
        try {
            await loginUser(email, password);
            // The AuthContext will automatically fetch the profile and update `isAdmin`
            return { success: true };
        } catch (error) {
            console.error("Admin login error:", error);
            // Firebase usually throws specific error codes we could parse
            return { success: false, message: 'Invalid email or password' };
        }
    };

    const adminLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Admin logout error:", error);
        }
    };

    const value = {
        isAdminAuthenticated,
        adminUser: profile, // Maps to the profile from Postgres
        loading, // Pass loading state to prevent immediate redirects on reload
        adminLogin,
        adminLogout
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export default AdminAuthContext;
