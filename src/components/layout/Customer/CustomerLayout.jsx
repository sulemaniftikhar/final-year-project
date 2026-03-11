import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Home, ShoppingBag, Award, User, MapPin,
  ChevronDown, Bell, Menu, X, QrCode, Package,
  Truck, Clock, Filter, LogOut, Settings, Heart
} from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';
import { useCart } from '../../../features/customer/CartContext';
import { restaurantService } from '../../../services/restaurant.service';
import LoginModal from '../../auth/LoginModal';

const CustomerLayout = ({ children }) => {
  const { isAuthenticated: isLoggedIn, profile, user } = useAuth();
  const { cartItems, cartTotal, cartCount } = useCart();
  const userName = profile?.fullName || user?.displayName || "Guest";

  const [isScrolled, setIsScrolled] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Default address from profile
  const defaultAddress = profile?.addresses?.find(a => a.isDefault) || profile?.addresses?.[0] || null;
  const streetAddress = defaultAddress?.fullAddress || defaultAddress?.street || '';
  const city = defaultAddress?.city || '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await restaurantService.getAllRestaurants();
        const allRestaurants = res.data || res || [];
        const query = searchQuery.toLowerCase();
        const filtered = allRestaurants.filter(r =>
          r.name?.toLowerCase().includes(query) ||
          r.cuisineTypes?.some(c => c.toLowerCase().includes(query)) ||
          r.description?.toLowerCase().includes(query)
        );
        setSearchResults(filtered.slice(0, 6));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const deliveryModes = [
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'pickup', label: 'Pickup', icon: Package },
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/customer' },
    { id: 'search', label: 'Search', icon: Search, path: '/customer' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/customer/profile' },
    { id: 'rewards', label: 'Rewards', icon: Award, path: '/customer/profile/rewards' },
    { id: 'profile', label: 'Profile', icon: User, path: '/customer/profile/settings' },
  ];

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../../../config/firebase');
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSearchSelect = (restaurant) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(`/customer/restaurant/${restaurant.id}`);
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <nav className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white shadow-lg border-b border-gray-200'
        : 'bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center space-x-8">
              <Link to="/customer" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">OQ</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  OrderIQ
                </span>
              </Link>

              {/* Search Bar */}
              <div className="relative w-96" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search restaurants or dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onFocus={() => setShowSearchDropdown(true)}
                  />
                </div>

                {/* Search Dropdown */}
                {showSearchDropdown && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No restaurants found for "{searchQuery}"</div>
                    ) : (
                      searchResults.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSearchSelect(r)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                        >
                          <img
                            src={r.coverImage || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=60&h=60&fit=crop'}
                            alt={r.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.cuisineTypes?.join(', ') || 'Restaurant'}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Mode, Address, Icons, Profile */}
            <div className="flex items-center space-x-6">
              {/* Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {deliveryModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDeliveryMode(mode.id)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${deliveryMode === mode.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Address/Pickup Pill */}
              <div className="flex items-center space-x-2">
                {deliveryMode === 'delivery' ? (
                  <button
                    onClick={() => isLoggedIn ? navigate('/customer/profile/addresses') : navigate('/register')}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 group relative"
                  >
                    {streetAddress ? (
                      <>
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium whitespace-nowrap">
                            Delivery to <span className="font-semibold">{streetAddress.substring(0, 20)}{streetAddress.length > 20 ? '...' : ''}</span>
                          </div>
                          {city && <div className="text-xs text-primary-500">{city}</div>}
                        </div>
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Add address</span>
                      </>
                    )}
                    <span className="absolute -top-1 -right-1 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Change
                    </span>
                  </button>
                ) : (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">Select pickup area</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dine-in CTA */}
              <button className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-accent-50 text-accent-600 rounded-lg hover:bg-accent-100">
                <QrCode className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">QR for dine-in</span>
              </button>

              {/* Icons (Logged in) */}
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate('/customer/checkout')}
                    className="relative p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ShoppingBag className="w-6 h-6 text-gray-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <Link to="/customer/profile/rewards" className="p-2 rounded-lg hover:bg-gray-100">
                    <Award className="w-6 h-6 text-gray-600" />
                  </Link>

                  <button className="relative p-2 rounded-lg hover:bg-gray-100">
                    <Bell className="w-6 h-6 text-gray-600" />
                  </button>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                          <div className="p-4 border-b border-gray-200">
                            <p className="font-bold text-gray-900">{userName}</p>
                            <p className="text-sm text-gray-500">{profile?.email || 'Customer'}</p>
                          </div>
                          <div className="p-2">
                            <Link
                              to="/customer/profile"
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <User className="w-4 h-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to="/customer/profile"
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>Orders</span>
                            </Link>
                            <Link
                              to="/customer/profile/favorites"
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Heart className="w-4 h-4" />
                              <span>Favorites</span>
                            </Link>
                            <Link
                              to="/customer/profile/rewards"
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Award className="w-4 h-4" />
                              <span>Rewards</span>
                            </Link>
                            <Link
                              to="/customer/profile/settings"
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600 w-full"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                // Guest Auth Buttons
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Address/Pickup Selector + Search */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => isLoggedIn ? navigate('/customer/profile/addresses') : navigate('/register')}
              className="flex items-center space-x-2 flex-1 min-w-0"
            >
              <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {deliveryMode === 'delivery' ? 'Delivery to' : 'Pickup from'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {streetAddress || 'Add delivery address'}
                </p>
                {city && (
                  <p className="text-xs text-primary-500 truncate">{city}</p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 ml-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onFocus={() => setShowSearchDropdown(true)}
            />
            {/* Mobile search results */}
            {showSearchDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500 text-sm">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">No results</div>
                ) : (
                  searchResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSearchSelect(r)}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.cuisineTypes?.join(', ')}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex mt-3 space-x-2">
            {deliveryModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setDeliveryMode(mode.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center space-x-2 ${deliveryMode === mode.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                <mode.icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">OQ</span>
                    </div>
                    <span className="text-xl font-bold">OrderIQ</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {isLoggedIn ? (
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{userName}</p>
                        <p className="text-sm text-gray-500">Customer</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${currentPath === item.path
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    <p className="text-gray-600">Sign in to access all features</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                        className="block w-full text-center py-3 border border-primary-600 text-primary-600 rounded-lg font-medium"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                        className="block w-full text-center py-3 bg-primary-600 text-white rounded-lg font-medium"
                      >
                        Sign up
                      </button>
                    </div>
                  </div>
                )}

                {/* Dine-in CTA */}
                <button className="w-full flex items-center justify-center space-x-2 py-3 bg-accent-50 text-accent-600 rounded-lg mb-6">
                  <QrCode className="w-5 h-5" />
                  <span className="font-medium">Scan QR for dine-in</span>
                </button>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700">Cart items</span>
                    <span className="font-bold text-gray-900">{cartCount}</span>
                  </div>
                  <button
                    onClick={() => { navigate('/customer/checkout'); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium"
                  >
                    View Cart{cartTotal > 0 ? ` • PKR ${cartTotal}` : ''}
                  </button>
                </div>

                {/* Logout */}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.id}
                to={isLoggedIn ? item.path : (['orders', 'rewards', 'profile'].includes(item.id) ? '/register' : item.path)}
                className={`flex flex-col items-center justify-center flex-1 ${isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-24 lg:pt-24 ${isLoggedIn ? 'pb-16 lg:pb-0' : 'pb-16'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>

      {/* Mobile Cart Bar */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 bg-primary-600 text-white rounded-lg shadow-lg z-30">
          <button
            onClick={() => navigate('/customer/checkout')}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="text-left">
              <p className="font-medium">View cart • {cartCount} item{cartCount !== 1 ? 's' : ''}</p>
              <p className="text-sm opacity-90">Total: PKR {cartTotal}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">Checkout</span>
            </div>
          </button>
        </div>
      )}
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => { setShowLoginModal(false); navigate('/register'); }}
      />
    </div>
  );
};

export default CustomerLayout;