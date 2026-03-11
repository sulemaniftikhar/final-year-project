import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, Settings as SettingsIcon, Gift, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';

const DashboardSidebar = () => {
    const { profile, user } = useAuth();
    const userName = profile?.fullName || user?.displayName || 'Customer';
    const userRole = profile?.role === 'RESTAURANT_OWNER' ? 'Restaurant Owner' : 'Customer';
    const location = useLocation();

    const sidebarItems = [
        { icon: ShoppingBag, label: 'Orders', path: '/customer/profile', active: true },
        { icon: Heart, label: 'Favorites', path: '/customer/profile/favorites', active: false },
        { icon: MapPin, label: 'Addresses', path: '/customer/profile/addresses', active: false },
        { icon: Gift, label: 'Rewards', path: '/customer/profile/rewards', active: false },
        { icon: Users, label: 'Referrals', path: '/customer/profile/referrals', active: false },
        { icon: SettingsIcon, label: 'Profile Settings', path: '/customer/profile/settings', active: false },
    ];

    const isActive = (path) => {
        if (path === '/customer/profile') {
            return location.pathname === '/customer/profile';
        }
        return location.pathname === path;
    };

    return (
        <div className="bg-white rounded-xl shadow border border-gray-100 h-fit">
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                        {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900">{userName}</h3>
                        <p className="text-xs text-neutral-500">{userRole}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="p-2">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-600 hover:bg-gray-50'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}

                {/* Logout Button */}
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2"
                    onClick={async () => {
                        try {
                            const { signOut } = await import('firebase/auth');
                            const { auth } = await import('../../../config/firebase');
                            await signOut(auth);
                            window.location.href = '/';
                        } catch (err) {
                            console.error('Logout failed:', err);
                        }
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default DashboardSidebar;
