import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"
import { useDashboard } from "@/context/DashboardContext"
import DashboardLayout from "@/components/layouts/DashboardLayout"

function AdminDashboardContent() {
  const { logout, user } = useAuth()
  const { getAllRestaurants, getAllOrders, getAllUsers } = useData()
  const { activeView, setActiveView } = useDashboard()

  const restaurants = getAllRestaurants()
  const orders = getAllOrders()
  const users = getAllUsers()

  // Mapped view
  const currentTab = ['dashboard', 'users', 'approvals', 'orders', 'analytics'].includes(activeView) ? activeView : 'dashboard'

  // Calculate metrics
  const totalUsers = users.customers.length + users.restaurants.length
  const totalOrders = orders.length
  const totalRestaurants = restaurants.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingApprovals = restaurants.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground capitalize mb-6">{currentTab === 'dashboard' ? 'Platform Overview' : currentTab.replace('-', ' ')}</h1>

      {currentTab === "dashboard" && (
        <div>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
              <button onClick={() => setActiveView('orders')} className="text-primary text-sm font-bold hover:underline">View All Orders</button>
            </div>
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
                      className={`text-xs px-2 py-1 rounded-full ${order.status === "delivered"
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

      {currentTab === "users" && (
        <div>
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

      {currentTab === "approvals" && (
        <div>
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

      {(currentTab === "orders") && (
        <div>
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
                          className={`px-2 py-1 rounded-full text-xs ${order.status === "delivered"
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

      {currentTab === "analytics" && (
        <div>
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
  )
}

export default function AdminDashboard(props) {
  return (
    <DashboardLayout>
      <AdminDashboardContent {...props} />
    </DashboardLayout>
  )
}
