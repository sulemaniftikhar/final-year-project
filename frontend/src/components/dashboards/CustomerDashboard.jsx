import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import { useDashboard } from "@/context/DashboardContext"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import RestaurantMenu from "../RestaurantMenu"
import CustomerProfile from "../profiles/CustomerProfile"
import { Icon } from '@iconify/react'

function CustomerDashboardContent({ isDemo }) {
  const { user } = useAuth()
  const { getCustomerOrders, getCustomerLoyaltyPoints, getAllRestaurants, addOrder } = useData()
  const { activeView, setActiveView } = useDashboard()

  const customerId = isDemo ? "demo-customer" : user?.id
  const customerOrders = getCustomerOrders(customerId)
  const loyaltyPoints = getCustomerLoyaltyPoints(customerId)
  const allRestaurants = getAllRestaurants()

  // Map activeView to internal tabs if needed, or just use activeView directly
  // Default to 'browse' if view is generic
  const currentTab = ['browse', 'orders', 'rewards', 'profile'].includes(activeView) ? activeView : 'browse'

  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)

  // Reset selected restaurant when view changes
  useEffect(() => {
    setSelectedRestaurant(null)
  }, [activeView])

  const handleOrderCheckout = (orderData) => {
    if (isDemo) {
      alert("Please login to place an order")
      return
    }
    setPendingOrder(orderData)
    setShowCheckoutModal(true)
  }

  const confirmOrder = () => {
    if (pendingOrder) {
      addOrder({
        customerId,
        ...pendingOrder,
        status: "pending",
        loyaltyPoints: Math.floor(pendingOrder.totalPrice / 100),
      })
      setPendingOrder(null)
      setShowCheckoutModal(false)
      setSelectedRestaurant(null)
      setActiveView("orders")
      alert("Order placed successfully! Check your orders.")
    }
  }

  if (selectedRestaurant) {
    return (
      <>
        <div className="mb-6">
          <button onClick={() => setSelectedRestaurant(null)} className="flex items-center gap-2 text-primary hover:underline font-bold">
            <Icon icon="lucide:arrow-left" /> Back to Browse
          </button>
        </div>
        <RestaurantMenu
          restaurantId={selectedRestaurant}
          onOrder={handleOrderCheckout}
          onBack={() => setSelectedRestaurant(null)}
        />
        {/* Checkout Modal */}
        {showCheckoutModal && pendingOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Confirm Order</h2>

              <div className="bg-muted rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                {pendingOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between mb-2">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-4 text-white mb-6">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>Rs. {pendingOrder.totalPrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery:</span>
                  <span>Rs. 100</span>
                </div>
                <div className="flex justify-between mb-3 border-t border-white/30 pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">Rs. {pendingOrder.totalPrice + 100}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground capitalize">{currentTab.replace('-', ' ')}</h1>

      {/* Browse Restaurants Tab */}
      {currentTab === "browse" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant.id)}
              className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border border-border"
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                {/* Placeholder or Image */}
                <Icon icon="lucide:utensils" className="text-4xl text-primary/50" />
                {restaurant.image && <img src={restaurant.image} className="absolute inset-0 w-full h-full object-cover" alt={restaurant.name} />}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-1">{restaurant.name}</h3>
                <p className="text-sm text-accent font-semibold mb-2">{restaurant.cuisine}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-bold text-foreground">{restaurant.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{restaurant.totalOrders} orders</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order History Tab */}
      {currentTab === "orders" && (
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          {customerOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {customerOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.createdAt.toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${order.status === "delivered"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-4 space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-foreground">
                        {item.quantity}x {item.name} - Rs. {item.price}
                      </p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <p className="font-bold text-lg text-foreground">Total: Rs. {order.totalPrice}</p>
                    {order.status === "delivered" && (
                      <p className="text-sm text-accent font-bold">+{order.loyaltyPoints} points</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-2xl text-muted-foreground">📭 No orders yet</p>
              <button
                onClick={() => setActiveView('browse')}
                className="mt-4 text-primary hover:underline font-bold"
              >
                Start by browsing restaurants
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {currentTab === "rewards" && (
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="relative z-10 text-center">
            <p className="text-6xl font-bold mb-4">{loyaltyPoints}</p>
            <h3 className="text-3xl font-bold mb-2">Loyalty Points Available</h3>
            <p className="text-lg opacity-90 mb-6">Earn 1 point for every 100 rupees spent</p>

            <div className="bg-white/20 border-2 border-white/40 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <p className="font-semibold">🎁 Referral Program: Invite friends and earn 50 bonus points!</p>
            </div>

            {!isDemo ? (
              <button className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
                Redeem Rewards
              </button>
            ) : (
              <div className="text-white/80 font-bold">Login to redeem rewards</div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'profile' && (
        <CustomerProfile />
      )}
    </div>
  )
}

export default function CustomerDashboard(props) {
  return (
    <DashboardLayout>
      <CustomerDashboardContent {...props} />
    </DashboardLayout>
  )
}
