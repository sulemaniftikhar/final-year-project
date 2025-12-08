
// App Router - Manages all page navigation and authentication flow
// Reference: SRS 3.2.1, 3.2.6 - Navigation and dashboards

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

import Navbar from "./Navbar"
import HomePage from "./HomePage"
import CustomerDashboard from "./dashboards/CustomerDashboard"
import RestaurantDashboard from "./dashboards/RestaurantDashboard"
import AdminDashboard from "./dashboards/AdminDashboard"
import CustomerSignIn from "./CustomerSignIn"
import CustomerSignUp from "./CustomerSignUp"
import RestaurantSignIn from "./RestaurantSignIn"
import RestaurantSignUp from "./RestaurantSignUp"
import AdminSignIn from "./AdminSignIn"
import AuthChoice from "./AuthChoice"

export default function AppRouter() {
  const { user, isAuthenticated, userRole } = useAuth()

  // Current page state
  const [currentPage, setCurrentPage] = useState("home")

  // Auth sub-page state for customer/restaurant auth
  const [authMode, setAuthMode] = useState("choice") // 'choice', 'customerSignIn', 'customerSignUp', 'restaurantSignIn', 'restaurantSignUp'

  useEffect(() => {
    if (isAuthenticated && user) {
      if (userRole === "customer") {
        setCurrentPage("customerDash")
      } else if (userRole === "restaurant") {
        setCurrentPage("restaurantDash")
      } else if (userRole === "admin") {
        setCurrentPage("adminDash")
      }
    } else {
      setCurrentPage("home")
      setAuthMode("choice")
    }
  }, [isAuthenticated, userRole, user])

  const handleCustomerClick = () => {
    setCurrentPage("customerDash")
  }

  const handleRestaurantClick = () => {
    setCurrentPage("restaurantDash")
  }

  const handleLoginClick = () => {
    setCurrentPage("auth")
    setAuthMode("choiceLogin")
  }

  const handleSignUpClick = () => {
    setCurrentPage("auth")
    setAuthMode("choiceSignUp")
  }

  const handleAdminClick = () => {
    setCurrentPage("auth")
    setAuthMode("adminSignIn")
  }

  const handleBackToHome = () => {
    setCurrentPage("home")
    setAuthMode("choice")
  }

  const handleCustomerSignIn = () => {
    setAuthMode("customerSignIn")
  }

  const handleCustomerSignUp = () => {
    setAuthMode("customerSignUp")
  }

  const handleRestaurantSignIn = () => {
    setAuthMode("restaurantSignIn")
  }

  const handleRestaurantSignUp = () => {
    setAuthMode("restaurantSignUp")
  }

  const handleAuthBack = () => {
    setCurrentPage("home")
    setAuthMode("choice")
  }

  const handleLoginSuccess = (role) => {
    if (role === "customer") {
      setCurrentPage("customerDash")
    } else if (role === "restaurant") {
      setCurrentPage("restaurantDash")
    }
  }

  const handleSignupSuccess = (role) => {
    if (role === "customer") {
      setCurrentPage("customerDash")
    } else if (role === "restaurant") {
      setCurrentPage("restaurantDash")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== "auth" && currentPage !== "adminDash" && (
        <Navbar
          onCustomerClick={handleCustomerClick}
          onRestaurantClick={handleRestaurantClick}
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
          onAdminClick={handleAdminClick}
        />
      )}

      {/* Home Page */}
      {currentPage === "home" && (
        <HomePage 
          onCustomerClick={handleCustomerClick}
          onRestaurantClick={handleRestaurantClick}
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
        />
      )}

      {/* Customer Dashboard */}
      {currentPage === "customerDash" && <CustomerDashboard onBack={handleBackToHome} isDemo={!isAuthenticated} />}

      {/* Restaurant Dashboard */}
      {currentPage === "restaurantDash" && <RestaurantDashboard onBack={handleBackToHome} isDemo={!isAuthenticated} />}

      {/* Admin Dashboard */}
      {currentPage === "adminDash" && <AdminDashboard />}

      {/* Admin Sign In */}
      {currentPage === "auth" && authMode === "adminSignIn" && <AdminSignIn onBack={handleAuthBack} />}

      {/* Auth Pages - Login Flow */}
      {currentPage === "auth" && authMode === "choiceLogin" && (
        <AuthChoice
          onCustomerChoice={handleCustomerSignIn}
          onRestaurantChoice={handleRestaurantSignIn}
          onBack={handleAuthBack}
        />
      )}

      {/* Auth Pages - SignUp Flow */}
      {currentPage === "auth" && authMode === "choiceSignUp" && (
        <AuthChoice
          onCustomerChoice={handleCustomerSignUp}
          onRestaurantChoice={handleRestaurantSignUp}
          onBack={handleAuthBack}
        />
      )}

      {currentPage === "auth" && authMode === "customerSignIn" && (
        <CustomerSignIn
          onBack={handleAuthBack}
          onSwitchToSignUp={handleCustomerSignUp}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === "auth" && authMode === "customerSignUp" && (
        <CustomerSignUp
          onBack={handleAuthBack}
          onSwitchToSignIn={handleCustomerSignIn}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {currentPage === "auth" && authMode === "restaurantSignIn" && (
        <RestaurantSignIn
          onBack={handleAuthBack}
          onSwitchToSignUp={handleRestaurantSignUp}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === "auth" && authMode === "restaurantSignUp" && (
        <RestaurantSignUp
          onBack={handleAuthBack}
          onSwitchToSignIn={handleRestaurantSignIn}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
    </div>
  )
}
