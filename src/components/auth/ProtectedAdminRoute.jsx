import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../features/admin/AdminAuthContext';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Protects admin routes — only allows ADMIN role.
 * Waits for the auth + profile to finish loading before making a decision.
 * If not authenticated or wrong role → redirect to landing page (/ ).
 * Admin login is handled by the unified LoginModal on the landing page.
 */
const ProtectedAdminRoute = ({ children }) => {
    const { user, profile, loading } = useAuth();
    const { isAdminAuthenticated } = useAdminAuth();

    // Show spinner while Firebase auth state is resolving
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // User is logged in but profile is still being fetched — wait
    if (user && profile === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not an admin — redirect to landing page
    if (!isAdminAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;
