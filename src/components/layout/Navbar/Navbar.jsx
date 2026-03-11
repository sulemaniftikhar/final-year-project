import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Menu as MenuIcon, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from "../../auth/LoginModal";
import ForgotPasswordModal from "../../auth/ForgotPasswordModal";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Cart count (mock)
  const cartCount = 3;

  const recentSearches = [
    'Pizza near me', 'Burger King', 'Sushi restaurants',
  ];

  const popularSuggestions = [
    'Indian', 'Italian', 'Chinese', 'Mexican', 'Healthy',
  ];

  const deliveryModes = [
    { id: 'delivery', label: 'Delivery' },
    { id: 'pickup', label: 'Pickup' },
    { id: 'dinein', label: 'Dine-in' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(e.target.value.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  useEffect(() => {
    // Initialize from URL on landing page
    if (location.pathname === '/') {
      const params = new URLSearchParams(location.search);
      const typeParam = params.get('type');
      if (typeParam && ['delivery', 'pickup', 'dinein'].includes(typeParam)) {
        setDeliveryMode(typeParam);
      }
      const searchParam = params.get('search');
      if (searchParam) setSearchQuery(searchParam);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Sync delivery mode to URL on landing page
    if (location.pathname === '/') {
      const url = new URL(window.location.href);
      url.searchParams.set('type', deliveryMode);
      window.history.replaceState({}, '', url);
    }
  }, [deliveryMode, location.pathname]);

  const handleOpenLogin = () => {
    setIsForgotOpen(false);
    setIsLoginOpen(true);
    setMobileMenuOpen(false);
  };

  const handleOpenForgot = () => {
    setIsLoginOpen(false);
    setIsForgotOpen(true);
  };

  // Hide this navbar on restaurant and admin dashboard pages
  if (location.pathname.startsWith('/restaurant') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
     <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onForgotPassword={handleOpenForgot}
      />
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSwitchToLogin={handleOpenLogin}
      />

      {/* Desktop Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-primary-50/90 backdrop-blur-md shadow-lg border-b border-primary-100'
        : 'bg-primary-50/70 backdrop-blur-sm border-b border-primary-100/20'
        }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">

            {/* Left: Logo */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                {/* Logo Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-xl font-sans">OQ</span>
                </div>
                {/* Logo Text */}
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                  OrderIQ
                </span>
              </Link>

              {/* Search Bar (Desktop) */}
              <div className="hidden lg:block relative w-96 group">
                <div className="relative transform transition-all duration-300 focus-within:scale-[1.02]">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for restaurants, cuisines..."
                    className="w-full pl-12 pr-10 py-3 bg-gray-100/50 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white transition-all shadow-inner"
                    onFocus={() => setShowSearchDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const url = new URL(window.location.href);
                        if (searchQuery) {
                          url.searchParams.set('search', searchQuery);
                        } else {
                          url.searchParams.delete('search');
                        }
                        window.history.replaceState({}, '', url);
                        const el = document.getElementById('restaurants');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                    {recentSearches.length > 0 && (
                      <div className="px-4 pb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                          Recent
                        </p>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button key={index} className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors group/item">
                              <span className="flex items-center">
                                <Search className="w-4 h-4 mr-3 text-gray-400 group-hover/item:text-purple-500" />
                                <span className="font-medium">{search}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="px-4 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                        Trending Now
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {popularSuggestions.map((suggestion, index) => (
                          <button key={index} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-all">
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Mode Selector & Auth */}
            <div className="flex items-center space-x-6">
              {/* Mode Selector */}
              <div className="hidden xl:flex items-center bg-gray-100/80 rounded-xl p-1.5 border border-gray-200">
                {deliveryModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDeliveryMode(mode.id)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${deliveryMode === mode.id
                      ? 'bg-white text-purple-600 shadow-sm scale-105'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Cart Button */}
              <Link
                to="/customer/checkout"
                className="relative p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/restaurant"
                  className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Partner with Us
                </Link>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleOpenLogin}
                    className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Log in
                  </button>
                  {/* SIGN UP BUTTON - Explicit Colors */}
                  <Link
                    to="/register"
                    className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 bg-white border border-gray-200 shadow-sm"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-800" />
                ) : (
                  <MenuIcon className="w-6 h-6 text-gray-800" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search & Filters Bar */}
        <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex mt-3 p-1 bg-gray-100 rounded-xl">
              {deliveryModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setDeliveryMode(mode.id)}
                  className={`flex-1 px-3 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMode === mode.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform border-l border-gray-100">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <span className="text-white font-bold text-xl">OQ</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">OrderIQ</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Account</p>
                  <button
                    onClick={handleOpenLogin}
                    className="flex items-center w-full px-4 py-3.5 text-purple-700 border border-purple-200 bg-purple-50/50 rounded-2xl font-bold hover:bg-purple-50 transition-colors"
                  >
                    Log in
                  </button>
                  <Link
                    to="/register"
                    className="flex items-center w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Business</p>
                  <Link
                    to="/restaurant"
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="font-semibold text-gray-700">For Restaurants</span>
                    <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
