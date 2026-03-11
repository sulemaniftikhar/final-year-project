import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Protects restaurant routes — only allows users with role RESTAURANT_OWNER.
 * If not authenticated → redirect to home.
 * If profile is still loading → show spinner (avoid premature redirects).
 * If authenticated but wrong role → redirect to home (landing page).
 */
const ProtectedRestaurantRoute = ({ children }) => {
    const { user, profile, loading } = useAuth();

    // Show loader while Firebase auth state or profile is being resolved
    if (loading || (user && profile === null)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not logged in → go to landing
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Logged in but not a restaurant owner → go to landing (not customer home)
    if (profile && profile.role !== 'RESTAURANT_OWNER') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRestaurantRoute;
