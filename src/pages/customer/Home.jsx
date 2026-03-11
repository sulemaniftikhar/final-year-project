import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/Customer/CustomerLayout';
import RestaurantCard from '../../components/customer/RestaurantCard';
import { useAuth } from '../../features/auth/AuthContext';
import { useCart } from '../../features/customer/CartContext';
import { orderService } from '../../services/order.service';
import {
  QrCode, Clock, Star, MapPin, ArrowRight,
  TrendingUp, Flame, Sparkles, ShoppingBag, Award,
  ChevronRight, Package
} from 'lucide-react';

const CustomerHome = () => {
  const { profile, user, isAuthenticated: isLoggedIn } = useAuth();
  const { cartItems: cartItemsList } = useCart();
  const navigate = useNavigate();
  const userName = profile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || "Guest";
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Default address from profile
  const defaultAddress = profile?.addresses?.find(a => a.isDefault) || profile?.addresses?.[0] || null;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { restaurantService } = await import('../../services/restaurant.service');
        const rData = await restaurantService.getAllRestaurants();
        setRestaurants(rData.data || rData);

        if (isLoggedIn) {
          const oData = await orderService.getOrders({ role: 'CUSTOMER' });
          const orders = oData.data?.orders || oData.data || [];
          const active = orders.find(o => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));

          if (active) {
            const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'];
            const currentIdx = statuses.indexOf(active.status);
            const progress = (Math.max(currentIdx, 0) / 4) * 100;
            const itemsSummary = active.items?.map(i => i.menuItem?.name || 'Item') || [];

            setActiveOrder({
              id: active.id || active._id || active.orderId,
              status: active.status,
              restaurant: active.restaurant?.name || 'Restaurant',
              estimatedTime: '30-45 min',
              progress: progress,
              items: itemsSummary
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  // Action Cards Data
  const actionCards = [
    {
      id: 'qr',
      title: 'Scan QR for dine-in',
      description: 'Order directly from your table',
      icon: QrCode,
      color: 'bg-gradient-to-r from-accent-500 to-pink-500',
      alwaysVisible: true,
      onClick: () => { },
    },
    {
      id: 'reorder',
      title: 'Reorder last order',
      description: 'Quickly get your favorites again',
      icon: ShoppingBag,
      color: 'bg-gradient-to-r from-primary-500 to-purple-500',
      visible: isLoggedIn,
      onClick: () => navigate('/customer/profile'),
    },
    {
      id: 'points',
      title: isLoggedIn ? `${profile?.rewardPoints || 0} points available` : 'Sign in to earn points',
      description: isLoggedIn ? 'Redeem rewards' : 'Join our loyalty program',
      icon: Award,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      alwaysVisible: true,
      onClick: () => navigate(isLoggedIn ? '/customer/profile/rewards' : '/register'),
    },
  ];

  // Map backend restaurants to our frontend UI rails
  // Currently we just show one rail with all, but we could filter by rating, etc.
  const restaurantRails = [
    {
      id: 'all',
      title: 'Restaurants near you',
      icon: Sparkles,
      restaurants: restaurants.map(r => ({
        ...r,
        // Map backend names to frontend expected names
        cuisines: r.cuisineTypes || [],
        deliveryTime: '25-35 min', // Mocked until backend supports
        deliveryFee: r.deliveryFee ? `PKR ${r.deliveryFee}` : 'Free',
        priceRange: r.priceRange || '$$',
        image: r.coverImage || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop'
      }))
    }
  ];

  // No Address Banner (for pickup mode)
  const showNoAddressBanner = deliveryMode === 'delivery' && !isLoggedIn;

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Context Header */}
        <div className="pt-6 lg:pt-8">
          {isLoggedIn ? (
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {greeting}, {userName}!
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span className="text-gray-600">
                  {defaultAddress ? (
                    <>Delivery to <span className="font-medium">{defaultAddress.fullAddress || defaultAddress.street}{defaultAddress.city ? `, ${defaultAddress.city}` : ''}</span></>
                  ) : (
                    'No delivery address saved'
                  )}
                </span>
                <button
                  onClick={() => navigate('/customer/profile/addresses')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {defaultAddress ? 'Change' : 'Add'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Discover great food near you
              </h1>
              <p className="text-gray-600 mt-2">
                Browse freely. Sign in to checkout and earn rewards.
              </p>
            </div>
          )}
        </div>

        {/* No Address Banner */}
        {showNoAddressBanner && (
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5" />
                <div>
                  <p className="font-medium">Add delivery address</p>
                  <p className="text-sm opacity-90">Enter your location to see restaurants</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100">
                Add Address
              </button>
            </div>
          </div>
        )}

        {/* Active Order Tracking Card */}
        {activeOrder && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-gray-900">Active Order</h2>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{activeOrder.restaurant} • {activeOrder.estimatedTime}</p>
              </div>
              <Link
                to={`/customer/orders/${activeOrder.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                Track <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Order placed</span>
                <span>Preparing</span>
                <span>On the way</span>
                <span>Delivered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${activeOrder.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <p className="font-medium text-gray-900">{activeOrder.items?.join(', ') || 'Various Items'}</p>
              </div>
              <Link to={`/customer/orders/${activeOrder.id}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                View Details
              </Link>
            </div>
          </div>
        )}

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionCards
            .filter(card => card.alwaysVisible || card.visible)
            .map((card) => (
              <div
                key={card.id}
                onClick={card.onClick}
                className={`${card.color} rounded-xl p-6 text-white cursor-pointer hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <card.icon className="w-8 h-8 mb-3" />
                    <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                    <p className="text-sm opacity-90">{card.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
        </div>

        {/* Discovery Rails */}
        <div className="space-y-8">
          {restaurantRails.map((rail) => (
            <div key={rail.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <rail.icon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">{rail.title}</h2>
                </div>

                <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                  See all <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Restaurant Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rail.restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    mode={deliveryMode}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>



        {/* Mobile-only QR CTA */}
        <div className="lg:hidden bg-gradient-to-r from-accent-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <QrCode className="w-12 h-12" />
            <div>
              <h3 className="text-lg font-bold mb-1">At a restaurant?</h3>
              <p className="text-sm opacity-90">Scan the QR code to order directly from your table</p>
            </div>
          </div>
          <button className="w-full mt-4 py-3 bg-white text-accent-600 rounded-lg font-bold">
            Open Scanner
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerHome;


