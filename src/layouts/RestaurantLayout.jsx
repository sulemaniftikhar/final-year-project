import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Clock,
  History,
  BarChart2,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Store,
  Menu as MenuIcon
} from 'lucide-react';
import { RestaurantProvider, useRestaurant } from '../features/restaurant/RestaurantContext';
import { useAuth } from '../features/auth/AuthContext';
import { logoutUser } from '../services/auth.service';

const RestaurantLayoutInner = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { profile, user } = useAuth();

  const restaurantName = restaurant?.name || 'My Restaurant';
  const ownerName = profile?.fullName || user?.displayName || 'Owner';
  const ownerEmail = profile?.email || user?.email || '';
  const initials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Navigation Items with corrected paths
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/restaurant/dashboard' },
    { id: 'live-orders', label: 'Live Orders', icon: ClipboardList, path: '/restaurant/live-orders' },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed, path: '/restaurant/menu' },
    { id: 'order-history', label: 'Order History', icon: History, path: '/restaurant/order-history' },
    { id: 'availability', label: 'Availability', icon: Clock, path: '/restaurant/availability' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/restaurant/analytics' },
    { id: 'team', label: 'Team', icon: Users, path: '/restaurant/team' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/restaurant/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const currentPath = location.pathname;
  // Fallback to 'Dashboard' if exact match fails, or check startWith
  const currentPageItem = navItems.find(item => currentPath.startsWith(item.path));
  const currentPageLabel = currentPageItem ? currentPageItem.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-neutral-200
        transform transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center justify-center border-b border-neutral-100">
            {sidebarCollapsed ? (
              <Store className="w-8 h-8 text-primary-500" />
            ) : (
              <div className="flex items-center gap-2 px-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {restaurantName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-900 leading-tight">{restaurantName}</span>
                  <span className="text-[10px] text-neutral-500 font-medium">Restaurant Admin</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.path) || (item.id === 'dashboard' && currentPath === '/restaurant');

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    flex items-center h-11 rounded-lg transition-all group relative
                    ${isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                    ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'}
                  `}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'} ${!sidebarCollapsed && 'mr-3'}`} />

                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}

                  {/* Active Indicator Strip */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary-500 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-neutral-100 space-y-1">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                   flex items-center w-full h-10 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 transition-colors
                   ${sidebarCollapsed ? 'justify-center' : 'px-3'}
               `}
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '-rotate-90' : 'rotate-90'}`} />
              {!sidebarCollapsed && <span className="font-medium text-sm ml-3">Collapse</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`
                flex items-center w-full h-10 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors
                ${sidebarCollapsed ? 'justify-center' : 'px-3'}
              `}
            >
              <LogOut className={`w-5 h-5 ${!sidebarCollapsed && 'mr-3'}`} />
              {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm/50">
          <h1 className="text-xl font-bold text-neutral-800">{currentPageLabel}</h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 hover:bg-neutral-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-neutral-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                  {initials}
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-neutral-50">
                    <p className="text-sm font-bold text-neutral-900">{restaurantName}</p>
                    <p className="text-xs text-neutral-500 truncate">{ownerEmail}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-600">Profile Settings</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-600">Help Center</button>
                  <div className="border-t border-neutral-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sub-layout Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const RestaurantLayout = () => (
  <RestaurantProvider>
    <RestaurantLayoutInner />
  </RestaurantProvider>
);

export default RestaurantLayout;