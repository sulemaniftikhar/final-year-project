
// App Router - Manages all page navigation and authentication flow
// Reference: SRS 3.2.1, 3.2.6 - Navigation and dashboards

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'


import PublicLayout from "./layouts/PublicLayout"
import FloatingLogoutButton from "./FloatingLogoutButton"
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
import RestaurantMenu from "./RestaurantMenu"

export default function AppRouter() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // if auth changes elsewhere the app can react here if needed
    // Forced update for HMR
  }, [isAuthenticated])

  const goCustomer = () => navigate('/customer')
  const goRestaurant = () => navigate('/restaurant')
  const goLogin = () => navigate('/auth')
  const goSignUp = () => navigate('/auth')
  const goAdmin = () => navigate('/auth/admin')

  const CustomerMenuWrapper = () => <CustomerDashboard onBack={() => navigate('/')} isDemo={!isAuthenticated} />
  const RestaurantMenuWrapper = () => <RestaurantDashboard onBack={() => navigate('/')} isDemo={!isAuthenticated} />
  const AdminWrapper = () => <AdminDashboard />

  function RestaurantMenuRoute() {
    const params = useParams()
    return <RestaurantMenu restaurantId={params.restaurantId} onBack={() => navigate(-1)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingLogoutButton />
      <Routes>
        <Route path="/" element={
          <PublicLayout
            onCustomerClick={goCustomer}
            onRestaurantClick={goRestaurant}
            onLoginClick={goLogin}
            onSignUpClick={goSignUp}
            onAdminClick={goAdmin}
          >
            <HomePage onCustomerClick={goCustomer} onRestaurantClick={goRestaurant} onLoginClick={goLogin} onSignUpClick={goSignUp} />
          </PublicLayout>
        } />
        <Route path="/customer" element={<CustomerMenuWrapper />} />
        <Route path="/restaurant" element={<RestaurantMenuWrapper />} />
        <Route path="/admin" element={<AdminWrapper />} />
        <Route path="/auth/admin" element={<AdminSignIn onBack={() => navigate('/')} />} />
        <Route path="/auth" element={
          <PublicLayout
            onCustomerClick={goCustomer}
            onRestaurantClick={goRestaurant}
            onLoginClick={goLogin}
            onSignUpClick={goSignUp}
            onAdminClick={goAdmin}
          >
            <AuthChoice onCustomerChoice={() => navigate('/auth/customer/signin')} onRestaurantChoice={() => navigate('/auth/restaurant/signin')} onBack={() => navigate('/')} />
          </PublicLayout>
        } />
        <Route path="/auth/customer/signin" element={<CustomerSignIn onBack={() => navigate('/auth')} onSwitchToSignUp={() => navigate('/auth/customer/signup')} onLoginSuccess={() => navigate('/customer')} />} />
        <Route path="/auth/customer/signup" element={<CustomerSignUp onBack={() => navigate('/auth')} onSwitchToSignIn={() => navigate('/auth/customer/signin')} onSignupSuccess={() => navigate('/customer')} />} />
        <Route path="/auth/restaurant/signin" element={<RestaurantSignIn onBack={() => navigate('/auth')} onSwitchToSignUp={() => navigate('/auth/restaurant/signup')} onLoginSuccess={() => navigate('/restaurant')} />} />
        <Route path="/auth/restaurant/signup" element={<RestaurantSignUp onBack={() => navigate('/auth')} onSwitchToSignIn={() => navigate('/auth/restaurant/signin')} onSignupSuccess={() => navigate('/restaurant')} />} />
        <Route path="/generate/:restaurantId" element={<RestaurantMenuRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
