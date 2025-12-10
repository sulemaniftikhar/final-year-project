
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import RestaurantMenu from "../RestaurantMenu"

export default function CustomerDashboard({ onBack, isDemo }) {
  const { user, logout } = useAuth()
  const { getCustomerOrders, getCustomerLoyaltyPoints, getAllRestaurants, addOrder } = useData()

  const customerId = isDemo ? "demo-customer" : user?.id
  const customerOrders = getCustomerOrders(customerId)
  const loyaltyPoints = getCustomerLoyaltyPoints(customerId)
  const allRestaurants = getAllRestaurants()

  const [activeTab, setActiveTab] = useState("browse")
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)

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
      setActiveTab("orders")
      alert("Order placed successfully! Check your orders.")
    }
  }

  if (selectedRestaurant) {
    return (
      <>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Customer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {isDemo ? "Demo Mode - Browse as Guest" : `Welcome, ${user?.name}`}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onBack}
              className="px-4 py-2 text-foreground border-2 border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all font-semibold"
            >
              ← Back Home
            </button>
            {user && (
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary hover:shadow-xl transition-shadow">
            <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
            <p className="text-4xl font-bold text-primary mt-2">{customerOrders.length}</p>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-accent hover:shadow-xl transition-shadow">
            <p className="text-muted-foreground text-sm font-medium">Loyalty Points</p>
            <p className="text-4xl font-bold text-accent mt-2">{loyaltyPoints}</p>
            <p className="text-xs text-muted-foreground mt-2">Redeem for discounts</p>
          </div>

          <div className="bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <p className="text-white opacity-80 text-sm font-medium">Account Status</p>
            <p className="text-4xl font-bold mt-2">{isDemo ? "Guest" : "Active"}</p>
            <p className="text-xs opacity-70 mt-2">{isDemo ? "Login to unlock benefits" : "Member benefits active"}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b-2 border-border">
          {["browse", "orders", "rewards"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold transition-all capitalize ${
                activeTab === tab
                  ? "text-primary border-b-4 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "browse" && "🏪 Browse Restaurants"}
              {tab === "orders" && "📋 My Orders"}
              {tab === "rewards" && "🎁 Rewards"}
            </button>
          ))}
        </div>

        {/* Browse Restaurants Tab */}
        {activeTab === "browse" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant.id)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <img
                    src={restaurant.image || "/placeholder.svg"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-accent font-semibold mb-2">{restaurant.cuisine}</p>
                  <p className="text-sm text-muted-foreground mb-3">{restaurant.address}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
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
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {customerOrders.length > 0 ? (
              <div className="divide-y">
                {customerOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-muted transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg text-foreground">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.createdAt.toLocaleDateString()}</p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "preparing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
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
                <p className="text-muted-foreground mt-2">Start by browsing restaurants</p>
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg p-8 text-white">
            <div className="text-center">
              <p className="text-6xl font-bold mb-4">{loyaltyPoints}</p>
              <h3 className="text-3xl font-bold mb-2">Loyalty Points Available</h3>
              <p className="text-lg opacity-90 mb-6">Earn 1 point for every 100 rupees spent</p>

              <div className="bg-white/20 border-2 border-white/40 rounded-lg p-4 mb-6">
                <p className="font-semibold">🎁 Referral Program: Invite friends and earn 50 bonus points!</p>
              </div>

              {!isDemo ? (
                <button className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:opacity-90 transition-opacity">
                  Redeem Rewards
                </button>
              ) : (
                <button className="px-8 py-3 bg-white/20 border-2 border-white text-white font-bold rounded-lg hover:bg-white/30 transition-all">
                  Login to Redeem
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
