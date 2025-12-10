import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from 'react-router-dom'
import { Icon } from "@iconify/react"

export default function Navbar({ onCustomerClick, onRestaurantClick, onLoginClick, onSignUpClick, onAdminClick, searchQuery = "", onSearchChange }) {
  const { user, isAuthenticated } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 text-primary">
              <Icon icon="lucide:bar-chart-2" className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OrderIQ
            </span>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon icon="lucide:search" className="text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 rounded-full border border-border bg-card text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all sm:text-sm"
                placeholder="Search for restaurants, cuisine or a dish..."
              />
            </div>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </a>
              <a href="#offers" className="text-sm font-medium hover:text-primary transition-colors">
                Offers
              </a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Help
              </a>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Search Button */}
              <button className="p-2 rounded-full hover:bg-muted transition-colors md:hidden">
                <Icon icon="lucide:search" className="w-5 h-5" />
              </button>

              {/* Shopping Cart */}
              <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-card text-foreground hover:bg-muted transition-colors">
                <Icon icon="lucide:shopping-cart" className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
              </button>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-foreground hidden sm:inline">
                    {user?.name}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="hidden sm:flex items-center justify-center px-6 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.5)]"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="md:hidden text-foreground text-2xl focus:outline-none hover:text-primary transition-colors"
                aria-label="Toggle menu"
              >
                {showMenu ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden pb-4 border-t border-border animate-in slide-in-from-top duration-200">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    onCustomerClick()
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-muted text-foreground font-semibold transition-colors"
                >
                  👤 Customer Dashboard
                </button>
                <button
                  onClick={() => {
                    onRestaurantClick()
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-muted text-foreground font-semibold transition-colors"
                >
                  🏪 Restaurant Dashboard
                </button>
                <button
                  onClick={() => {
                    if (onAdminClick) onAdminClick()
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-muted text-foreground font-semibold transition-colors"
                >
                  🔐 Admin Dashboard
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => {
                  onLoginClick()
                  setShowMenu(false)
                }}
                className="block w-full text-left px-4 py-3 hover:bg-muted text-primary font-semibold transition-colors"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
