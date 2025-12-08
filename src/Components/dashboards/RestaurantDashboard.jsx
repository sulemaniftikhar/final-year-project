
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"

export default function RestaurantDashboard({ onBack, isDemo }) {
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

  const restaurantId = isDemo ? "rest1" : user?.id
  const restaurantOrders = getRestaurantOrders(restaurantId)
  const restaurantMenu = getRestaurantMenu(restaurantId)
  const restaurantStats = getRestaurantStats(restaurantId)

  const [activeTab, setActiveTab] = useState("orders")
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
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-accent">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-accent">Restaurant Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {isDemo ? "Demo Mode - Karachi Biryani House" : user?.restaurantName || "Restaurant Manager"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onBack}
              className="px-4 py-2 text-foreground border-2 border-accent rounded-lg hover:bg-accent hover:text-accent-foreground transition-all font-semibold"
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{restaurantStats.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <p className="text-muted-foreground text-sm font-medium">Pending Orders</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{restaurantStats.pendingOrders}</p>
            <p className="text-xs text-muted-foreground mt-2">Awaiting attention</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">Rs. {restaurantStats.totalRevenue}</p>
            <p className="text-xs text-muted-foreground mt-2">Lifetime earnings</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary hover:shadow-xl transition-shadow">
            <p className="text-muted-foreground text-sm font-medium">Menu Items</p>
            <p className="text-4xl font-bold text-primary mt-2">{restaurantMenu.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Available dishes</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b-2 border-border">
          {["orders", "menu"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold transition-all capitalize ${
                activeTab === tab
                  ? "text-accent border-b-4 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "orders" && "📦 Orders"}
              {tab === "menu" && "🍽️ Menu Management"}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {restaurantOrders.length > 0 ? (
              <div className="divide-y">
                {restaurantOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-muted transition-colors">
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
                        className={`px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "preparing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
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
        {activeTab === "menu" && (
          <div>
            {/* Add Menu Item Button */}
            <button
              onClick={() => {
                setShowAddMenuItem(!showAddMenuItem)
                setEditingItem(null)
                setNewMenuItem({ name: "", price: "", category: "Main Course" })
              }}
              disabled={isDemo}
              className="mb-6 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showAddMenuItem ? "Cancel" : "➕ Add Menu Item"}
            </button>

            {/* Add/Edit Menu Item Form */}
            {showAddMenuItem && !isDemo && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
                      className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-accent"
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
                        className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Category</label>
                      <select
                        value={newMenuItem.category}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-accent"
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
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-40 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/placeholder.svg")}
                    />
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
      </main>
    </div>
  )
}
