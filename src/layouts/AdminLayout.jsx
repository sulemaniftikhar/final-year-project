import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Users, Store, Settings, LogOut,
    ChevronDown, Bell, Search, ShieldCheck, ShoppingBag,
    Megaphone, Activity, FileBarChart, Calendar
} from 'lucide-react';
import { useAdminAuth } from '../features/admin/AdminAuthContext';
import { DATE_RANGE_OPTIONS, getDateRangeLabel, useAdminFilters } from '../features/admin/AdminFiltersContext';

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);
    const [dateMenuOpen, setDateMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { adminLogout, adminUser } = useAdminAuth();
    const adminMenuRef = useRef(null);
    const dateMenuRef = useRef(null);
    const { searchQuery, setSearchQuery, dateRange, setDateRange } = useAdminFilters();

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
        { id: 'restaurants', label: 'Restaurants', icon: Store, path: '/admin/restaurants' },
        { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone, path: '/admin/campaigns' },
        //{ id: 'monitoring', label: 'Monitoring', icon: Activity, path: '/admin/monitoring' },
        //{ id: 'reports', label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        adminLogout();
        navigate('/');
    };

    const currentPath = location.pathname;
    const currentPage = navItems.find(item => currentPath.startsWith(item.path))?.label || 'Overview';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (adminMenuOpen && adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
                setAdminMenuOpen(false);
            }
            if (dateMenuOpen && dateMenuRef.current && !dateMenuRef.current.contains(event.target)) {
                setDateMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [adminMenuOpen, dateMenuOpen]);

    useEffect(() => {
        setAdminMenuOpen(false);
        setDateMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 bg-neutral-900 text-white
        transform transition-all duration-200 ease-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="h-16 flex items-center justify-center border-b border-neutral-800">
                        {sidebarCollapsed ? (
                            <ShieldCheck className="w-8 h-8 text-primary-500" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-primary-500" />
                                <span className="font-bold text-lg tracking-tight">OrderIQ Admin</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPath.startsWith(item.path);

                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={`flex items-center h-11 rounded-lg transition-all ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                        }
                                        ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'} `}
                                    title={sidebarCollapsed ? item.label : ''}
                                >
                                    <Icon className={`w-5 h-5 ${!sidebarCollapsed && 'mr-3'}`} />
                                    {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-3 border-t border-neutral-800 space-y-2">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`
                    flex items-center w-full h-10 rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors
                    ${sidebarCollapsed ? 'justify-center' : 'px-3'}
                `}
                            title="Toggle Sidebar"
                        >
                            <ChevronDown className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '-rotate-90' : 'rotate-90'}`} />
                            {!sidebarCollapsed && <span className="font-medium text-sm ml-3">Collapse</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            className={`
                flex items-center w-full h-10 rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-red-400 transition-colors
                ${sidebarCollapsed ? 'justify-center' : 'px-3'}
              `}
                            title="Logout"
                        >
                            <LogOut className={`w-5 h-5 ${!sidebarCollapsed && 'mr-3'}`} />
                            {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-200 flex flex-col ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">{currentPage}</h1>

                    <div className="flex items-center gap-4">
                        {/* Global Search */}
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500" />
                            <input
                                type="text"
                                placeholder="Search restaurants, users, orders..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white w-[320px] lg:w-[420px] transition-all"
                            />
                        </div>

                        {/* Date Range (Contextual) */}
                        {(currentPage === 'Overview' || currentPage === 'Monitoring') && (
                            <div className="relative hidden lg:flex" ref={dateMenuRef}>
                                <button
                                    onClick={() => setDateMenuOpen(!dateMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>{getDateRangeLabel(dateRange)}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {dateMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                                        {DATE_RANGE_OPTIONS.map(option => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setDateRange(option.id);
                                                    setDateMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${dateRange === option.id ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications */}
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {/* Profile Menu */}
                        <div className="relative" ref={adminMenuRef}>
                            <button
                                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            >
                                <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-neutral-100">AD</div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-700 leading-none">{adminUser?.name || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-500 leading-none mt-1">Super User</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {adminMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                                    <NavLink
                                        to="/admin/settings"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 flex-1 overflow-y-auto w-full max-w-[1520px] mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
