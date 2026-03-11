import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';

//Auth Pages
import RoleSelection from './pages/auth/RoleSelection';
import CustomerSignup from './pages/auth/CustomerSignup';
import RestaurantSignup from './pages/auth/RestaurantSignup';

//Admin Auth
import { AdminAuthProvider } from './features/admin/AdminAuthContext';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import ProtectedRestaurantRoute from './components/auth/ProtectedRestaurantRoute';

//Customer 
import { CartProvider } from './features/customer/CartContext';
import CustomerHome from './pages/customer/Home'
import RestaurantDetails from './pages/customer/RestaurantDetails';
import CartPage from './pages/customer/CartPage';
import OrderTracking from './pages/customer/OrderTracking';
import Profile from './pages/customer/Profile';
import Favorites from './pages/customer/Favorites';
import Addresses from './pages/customer/Addresses';
import ProfileSettings from './pages/customer/ProfileSettings';
import Rewards from './pages/customer/Rewards';
import Referrals from './pages/customer/Referrals';

//Restaurant
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantLayout from "./layouts/RestaurantLayout";
import LiveOrders from './pages/restaurant/LiveOrders';
import Menu from './pages/restaurant/MenuManagement';
import OrderHistory from './pages/restaurant/OrderHistory';
import Availability from './pages/restaurant/Availability';
import Team from './pages/restaurant/Team';
import Settings from './pages/restaurant/Settings';
import Analytics from './pages/restaurant/Analytics';

//Admin
import AdminLayout from './layouts/AdminLayout';
import { AdminFiltersProvider } from './features/admin/AdminFiltersContext';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminCampaigns from './pages/admin/Campaigns';
import AdminSettings from './pages/admin/Settings';


function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RoleSelection />} />
      <Route path="/register/customer" element={<CustomerSignup />} />
      <Route path="/register/restaurant" element={<RestaurantSignup />} />


      {/*Customer Dashboard*/}
      <Route element={<CartProvider><Outlet /></CartProvider>}>
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/customer/checkout" element={<CartPage />} />
        <Route path="/customer/orders/:id" element={<OrderTracking />} />
        <Route path="/customer/orders" element={<Profile />} />
        <Route path="/customer/profile" element={<Profile />} />
        <Route path="/customer/profile/favorites" element={<Favorites />} />
        <Route path="/customer/profile/addresses" element={<Addresses />} />
        <Route path="/customer/profile/settings" element={<ProfileSettings />} />
        <Route path="/customer/profile/rewards" element={<Rewards />} />
        <Route path="/customer/profile/referrals" element={<Referrals />} />
      </Route>

      {/*Restaurant*/}
      <Route path="/restaurant" element={
        <ProtectedRestaurantRoute>
          <RestaurantLayout />
        </ProtectedRestaurantRoute>
      }>
        <Route index element={<RestaurantDashboard />} />
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="live-orders" element={<LiveOrders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="order-history" element={<OrderHistory />} />
        <Route path="availability" element={<Availability />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>


      {/* Admin Dashboard (protected) */}
      <Route path="/admin" element={
        <AdminAuthProvider>
          <ProtectedAdminRoute>
            <AdminFiltersProvider>
              <AdminLayout />
            </AdminFiltersProvider>
          </ProtectedAdminRoute>
        </AdminAuthProvider>
      }>

        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="settings" element={<AdminSettings />} />

      </Route>

    </Routes>
  );
}

export default App;
