import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"

export default function AdminDashboard() {
  const { logout, user } = useAuth()
  const { getAllRestaurants, getAllOrders, getAllUsers } = useData()
  const [activeTab, setActiveTab] = useState("dashboard")

  const restaurants = getAllRestaurants()
  const orders = getAllOrders()
  const users = getAllUsers()

  // Calculate metrics
  const totalUsers = users.customers.length + users.restaurants.length
  const totalOrders = orders.length
  const totalRestaurants = restaurants.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingApprovals = restaurants.filter((r) => r.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Control Panel</h1>
              <p className="text-purple-200 text-sm">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-orange-50 transition-all font-semibold shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
              { id: "users", label: "👥 User Management", icon: "👥" },
              { id: "approvals", label: "✅ Restaurant Approvals", icon: "✅" },
              { id: "orders", label: "📦 Order Management", icon: "📦" },
              { id: "analytics", label: "📈 Reports & Analytics", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Platform Overview</h2>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalUsers}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {users.customers.length} customers, {users.restaurants.length} restaurants
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Orders</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalOrders}</p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
                <p className="text-xs text-green-600 mt-2">+12% from last month</p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Restaurants</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalRestaurants}</p>
                  </div>
                  <div className="text-4xl">🏪</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{pendingApprovals} pending approval</p>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground mt-1">Rs {totalRevenue.toFixed(0)}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
                <p className="text-xs text-green-600 mt-2">+8% from last month</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-semibold text-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">Rs {order.total}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">User Management</h2>
            <p className="text-muted-foreground mb-4">
              Manage all registered customers and restaurant owners on the platform.
            </p>

            {/* Customers Table */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6 mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Customers ({users.customers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-foreground">{customer.name}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{customer.email}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{customer.phone || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button className="text-red-600 hover:text-red-800 font-semibold">Suspend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Restaurants Table */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Restaurant Owners ({users.restaurants.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Restaurant</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-foreground">{restaurant.name}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{restaurant.email}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{restaurant.restaurantName}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button className="text-red-600 hover:text-red-800 font-semibold">Suspend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Restaurant Approval Queue</h2>
            <p className="text-muted-foreground mb-4">
              Review and approve new restaurant registrations before they go live.
            </p>

            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <div className="space-y-4">
                {restaurants
                  .filter((r) => r.status === "pending")
                  .map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg"></div>
                        <div>
                          <h4 className="font-semibold text-foreground">{restaurant.name}</h4>
                          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                          <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                {restaurants.filter((r) => r.status === "pending").length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No pending restaurant approvals</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Order Management</h2>
            <p className="text-muted-foreground mb-4">View and manage all orders across the platform.</p>

            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Restaurant</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{order.customerName}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{order.restaurantName}</td>
                        <td className="px-4 py-3 text-sm text-foreground">Rs {order.total}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-semibold">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Reports & Analytics</h2>
            <p className="text-muted-foreground mb-4">Platform performance metrics and insights.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-card rounded-xl shadow-md border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trends</h3>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Chart visualization coming soon</p>
                </div>
              </div>

              {/* Order Stats */}
              <div className="bg-card rounded-xl shadow-md border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Order Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-bold text-foreground">{totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Order Value</span>
                    <span className="font-bold text-foreground">
                      Rs {(totalRevenue / totalOrders).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completed Orders</span>
                    <span className="font-bold text-foreground">
                      {orders.filter((o) => o.status === "delivered").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pending Orders</span>
                    <span className="font-bold text-foreground">
                      {orders.filter((o) => o.status === "pending").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Restaurants */}
              <div className="bg-card rounded-xl shadow-md border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Restaurants</h3>
                <div className="space-y-3">
                  {restaurants
                    .sort((a, b) => b.totalOrders - a.totalOrders)
                    .slice(0, 5)
                    .map((restaurant, index) => (
                      <div key={restaurant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">{index + 1}</span>
                          <div>
                            <p className="font-semibold text-foreground">{restaurant.name}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-foreground">{restaurant.totalOrders} orders</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* User Growth */}
              <div className="bg-card rounded-xl shadow-md border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">User Growth</h3>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
