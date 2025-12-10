

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'

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
import RestaurantMenu from "./RestaurantMenu"

export default function AppRouter() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // if auth changes elsewhere the app can react here if needed
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
      <Navbar
        onCustomerClick={goCustomer}
        onRestaurantClick={goRestaurant}
        onLoginClick={goLogin}
        onSignUpClick={goSignUp}
        onAdminClick={goAdmin}
      />

      <Routes>
        <Route path="/" element={<HomePage onCustomerClick={goCustomer} onRestaurantClick={goRestaurant} onLoginClick={goLogin} onSignUpClick={goSignUp} />} />
        <Route path="/customer" element={<CustomerMenuWrapper />} />
        <Route path="/restaurant" element={<RestaurantMenuWrapper />} />
        <Route path="/admin" element={<AdminWrapper />} />
        <Route path="/auth/admin" element={<AdminSignIn onBack={() => navigate('/')} />} />
        <Route path="/auth" element={<AuthChoice onCustomerChoice={() => navigate('/auth/customer/signin')} onRestaurantChoice={() => navigate('/auth/restaurant/signin')} onBack={() => navigate('/')} />} />
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
