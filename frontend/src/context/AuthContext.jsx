
// Auth Context - Manages user authentication state across the app
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02, FR-03)
// This context provides user info and auth methods to all components

import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from 'react-router-dom'

// Create the context
const AuthContext = createContext()

// Provider component - wraps the app to provide auth state
export function AuthProvider({ children }) {
  // Current logged-in user
  const [user, setUser] = useState(null)

  // User role: 'customer', 'restaurant', 'admin', or null
  const [userRole, setUserRole] = useState(null)

  // Loading state during auth operations
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setUserRole(userData.role)
      } catch (error) {
        console.error("Failed to load user from localStorage:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  // Login function
  const login = (userData) => {
    // userData should include: { id, email, role, name, ... }
    setUser(userData)
    setUserRole(userData.role)
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(userData))
  }

  // Signup function
  const signup = (userData) => {
    // Create new user account
    setUser(userData)
    setUserRole(userData.role)
    // In real app, this calls backend API
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setUserRole(null)
    localStorage.removeItem("user")
    // Force app to recognize logout immediately
    try {
      // useNavigate hook is available because AuthProvider is rendered inside BrowserRouter
      navigate('/')
    } catch (e) {
      // fallback
      window.location.href = '/'
    }
  }

  // Check if user is authenticated
  const isAuthenticated = user !== null

  // Get current user data
  const getCurrentUser = () => user

  // Check if user has specific role
  const hasRole = (role) => userRole === role

  // Context value object
  const value = {
    user,
    userRole,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    getCurrentUser,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
