import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import { useDashboard } from "@/context/DashboardContext"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import RestaurantProfile from "../profiles/RestaurantProfile"

function RestaurantDashboardContent({ isDemo }) {
  const { user, logout } = useAuth()
  const {
    getRestaurantOrders,
    getRestaurantMenu,
    getRestaurantStats,
    updateOrderStatus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = useData()
  const { activeView, setActiveView } = useDashboard()

  const restaurantId = isDemo ? "rest1" : user?.id
  const restaurantOrders = getRestaurantOrders(restaurantId)
  const restaurantMenu = getRestaurantMenu(restaurantId)
  const restaurantStats = getRestaurantStats(restaurantId)

  // Mapping view to content
  const currentTab = ['dashboard', 'orders', 'menu', 'profile', 'analytics'].includes(activeView) ? activeView : 'dashboard'

  const [showAddMenuItem, setShowAddMenuItem] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    category: "Main Course",
  })

  // Handle add/update menu item
  const handleSaveMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price) {
      if (editingItem) {
        updateMenuItem(restaurantId, editingItem.id, {
          name: newMenuItem.name,
          price: Number.parseInt(newMenuItem.price),
          category: newMenuItem.category,
        })
        setEditingItem(null)
      } else {
        addMenuItem(restaurantId, {
          ...newMenuItem,
          price: Number.parseInt(newMenuItem.price),
          stock: 50,
          image: "/placeholder.svg",
        })
      }
      setNewMenuItem({ name: "", price: "", category: "Main Course" })
      setShowAddMenuItem(false)
    }
  }

  // Start editing
  const startEditItem = (item) => {
    setEditingItem(item)
    setNewMenuItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
    })
    setShowAddMenuItem(true)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null)
    setNewMenuItem({ name: "", price: "", category: "Main Course" })
    setShowAddMenuItem(false)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground capitalize mb-6">{currentTab.replace('-', ' ')}</h1>

      {/* Stats Section (Visible on Dashboard Only) */}
      {currentTab === 'dashboard' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow border-t border-r border-b border-border">
            <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{restaurantStats.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow border-t border-r border-b border-border">
            <p className="text-muted-foreground text-sm font-medium">Pending Orders</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{restaurantStats.pendingOrders}</p>
            <p className="text-xs text-muted-foreground mt-2">Awaiting attention</p>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow border-t border-r border-b border-border">
            <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">Rs. {restaurantStats.totalRevenue}</p>
            <p className="text-xs text-muted-foreground mt-2">Lifetime earnings</p>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-primary hover:shadow-xl transition-shadow border-t border-r border-b border-border">
            <p className="text-muted-foreground text-sm font-medium">Menu Items</p>
            <p className="text-4xl font-bold text-primary mt-2">{restaurantMenu.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Available dishes</p>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {(currentTab === "orders" || currentTab === "dashboard") && (
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            {currentTab === 'dashboard' && <button onClick={() => setActiveView('orders')} className="text-primary text-sm font-bold hover:underline">View All</button>}
          </div>
          {restaurantOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {restaurantOrders.slice(0, currentTab === 'dashboard' ? 5 : undefined).map((order) => (
                <div key={order.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={isDemo}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer ${order.status === "delivered"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : order.status === "preparing"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div className="mb-4 space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-foreground">
                        {item.quantity}x {item.name} - Rs. {item.price}
                      </p>
                    ))}
                  </div>
                  <p className="font-bold text-lg text-foreground pt-4 border-t border-border">
                    Total: Rs. {order.totalPrice}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-2xl text-muted-foreground">📭 No orders yet</p>
            </div>
          )}
        </div>
      )}

      {/* Menu Management Tab */}
      {currentTab === "menu" && (
        <div>
          {/* Add Menu Item Button */}
          <button
            onClick={() => {
              setShowAddMenuItem(!showAddMenuItem)
              setEditingItem(null)
              setNewMenuItem({ name: "", price: "", category: "Main Course" })
            }}
            disabled={isDemo}
            className="mb-6 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {showAddMenuItem ? "Cancel" : "➕ Add Menu Item"}
          </button>

          {/* Add/Edit Menu Item Form */}
          {showAddMenuItem && !isDemo && (
            <div className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border">
              <h3 className="font-bold text-lg text-foreground mb-4">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Item Name</label>
                  <input
                    type="text"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    placeholder="e.g., Chicken Biryani"
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-accent bg-background"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Price (Rs.)</label>
                    <input
                      type="number"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                      placeholder="350"
                      className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-accent bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Category</label>
                    <select
                      value={newMenuItem.category}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-accent bg-background"
                    >
                      <option>Main Course</option>
                      <option>Appetizer</option>
                      <option>Bread</option>
                      <option>Side</option>
                      <option>Dessert</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveMenuItem}
                    className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-bold"
                  >
                    {editingItem ? "Update Item" : "Add Item"}
                  </button>
                  {editingItem && (
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-3 border-2 border-border rounded-lg hover:bg-muted transition-colors font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Menu Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantMenu.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border"
              >
                <div className="h-40 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative">
                  {/* Image or Placeholder */}
                  {item.image && !item.image.includes('placeholder') ? (
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  ) : (
                    <span className="text-4xl text-accent/50">🍽️</span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg text-foreground mb-1">{item.name}</h4>
                  <p className="text-sm text-accent font-semibold mb-2">{item.category}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-foreground">Rs. {item.price}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      Stock: {item.stock}
                    </span>
                  </div>
                  {!isDemo && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditItem(item)}
                        className="flex-1 text-sm text-accent font-bold hover:opacity-70 transition-opacity py-2 border-2 border-accent rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMenuItem(restaurantId, item.id)}
                        className="flex-1 text-sm text-destructive font-bold hover:opacity-70 transition-opacity py-2 border-2 border-destructive rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === 'profile' && (
        <RestaurantProfile />
      )}

      {currentTab === 'analytics' && (
        <div className="bg-card p-12 text-center rounded-xl border border-border">
          <p className="text-2xl text-muted-foreground mb-4">Analytics Module</p>
          <p className="text-muted-foreground">Detailed revenue, order trends, and customer insights coming soon.</p>
        </div>
      )}
    </div>
  )
}

export default function RestaurantDashboard(props) {
  return (
    <DashboardLayout>
      <RestaurantDashboardContent {...props} />
    </DashboardLayout>
  )
}
