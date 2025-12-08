
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function Navbar({ onCustomerClick, onRestaurantClick, onLoginClick, onSignUpClick, onAdminClick }) {
  const { user, logout, isAuthenticated } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OrderIQ
            </div>
          </div>

          {/* Center Navigation - Role Selection */}
          <div className="hidden md:flex gap-6 items-center">
            {!isAuthenticated && (
              <>
                <button
                  onClick={onCustomerClick}
                  className="px-4 py-2 text-foreground hover:text-primary font-semibold transition-colors"
                >
                  👤 Customer
                </button>
                <button
                  onClick={onRestaurantClick}
                  className="px-4 py-2 text-foreground hover:text-accent font-semibold transition-colors"
                >
                  🏪 Restaurant
                </button>
                <button
                  onClick={onAdminClick}
                  className="px-4 py-2 text-foreground hover:text-primary font-semibold transition-colors"
                >
                  🔐 Admin
                </button>
              </>
            )}
          </div>

          {/* Right - User Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground hidden sm:inline">{user?.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-primary font-semibold hover:opacity-80 transition-opacity"
                >
                  Login
                </button>
                <button
                  onClick={onSignUpClick}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </button>
              </div>
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
