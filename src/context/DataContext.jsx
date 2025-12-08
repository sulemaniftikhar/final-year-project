
import { createContext, useState, useContext } from "react"
import { sendOrderConfirmationEmail, sendOrderStatusEmail, sendRestaurantApprovalEmail } from "@/lib/emailAPI"
import { toast } from "sonner"

const DataContext = createContext()

// Mock restaurants with Pakistani & Indian cuisine focus
const mockRestaurants = [
  {
    id: "rest1",
    name: "Karachi Biryani House",
    cuisine: "Pakistani",
    address: "Lahore, Punjab",
    phone: "03001234567",
    rating: 4.8,
    totalOrders: 450,
    image: "/flavorful-biryani.png",
    description: "Authentic Karachi biryani with traditional recipes passed down for generations",
  },
  {
    id: "rest2",
    name: "Italian Kitchen Express",
    cuisine: "Italian",
    address: "Islamabad, Federal",
    phone: "03004567890",
    rating: 4.5,
    totalOrders: 320,
    image: "/delicious-pizza.png",
    description: "Fresh Italian pizzas and pastas prepared with imported ingredients",
  },
  {
    id: "rest3",
    name: "Dragon Palace",
    cuisine: "Chinese",
    address: "Karachi, Sindh",
    phone: "03009876543",
    rating: 4.6,
    totalOrders: 380,
    image: "/colorful-pasta-arrangement.png",
    description: "Authentic Chinese cuisine with fast and fresh preparation",
  },
  {
    id: "rest4",
    name: "Tandoori Junction",
    cuisine: "Indian",
    address: "Faisalabad, Punjab",
    phone: "03112233445",
    rating: 4.7,
    totalOrders: 520,
    image: "/seekh-kabab.jpg",
    description: "Delicious tandoori and grilled specialties cooked in traditional clay ovens",
  },
  {
    id: "rest5",
    name: "Kabab Corner",
    cuisine: "Pakistani",
    address: "Multan, Punjab",
    phone: "03225566778",
    rating: 4.4,
    totalOrders: 290,
    image: "/garlic-bread.png",
    description: "Premium kebabs and grilled meats with aromatic spices",
  },
  {
    id: "rest6",
    name: "Thai Delights",
    cuisine: "Thai",
    address: "Rawalpindi, Punjab",
    phone: "03334455667",
    rating: 4.3,
    totalOrders: 210,
    image: "/naan-bread.png",
    description: "Authentic Thai flavors bringing heat and spice to your table",
  },
]

const mockOrders = [
  {
    id: "ORD001",
    customerId: "cust1",
    restaurantId: "rest1",
    items: [
      { name: "Biryani", quantity: 2, price: 350 },
      { name: "Raita", quantity: 1, price: 100 },
    ],
    totalPrice: 800,
    status: "delivered",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    loyaltyPoints: 8,
  },
  {
    id: "ORD002",
    customerId: "cust1",
    restaurantId: "rest2",
    items: [{ name: "Pizza Margherita", quantity: 1, price: 600 }],
    totalPrice: 600,
    status: "delivered",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    loyaltyPoints: 6,
  },
]

const mockMenuItems = {
  rest1: [
    { id: "m1", name: "Biryani", price: 350, category: "Main Course", image: "/flavorful-biryani.png", stock: 45 },
    { id: "m2", name: "Seekh Kabab", price: 200, category: "Appetizer", image: "/seekh-kabab.jpg", stock: 30 },
    { id: "m3", name: "Naan", price: 50, category: "Bread", image: "/naan-bread.png", stock: 100 },
  ],
  rest2: [
    { id: "p1", name: "Pizza Margherita", price: 600, category: "Pizza", image: "/delicious-pizza.png", stock: 15 },
    {
      id: "p2",
      name: "Pasta Carbonara",
      price: 550,
      category: "Pasta",
      image: "/colorful-pasta-arrangement.png",
      stock: 12,
    },
  ],
}

export function DataProvider({ children }) {
  const [orders, setOrders] = useState(mockOrders)
  const [menuItems, setMenuItems] = useState(mockMenuItems)
  const [restaurants, setRestaurants] = useState(mockRestaurants)

  const getCustomerOrders = (customerId) => {
    return orders.filter((order) => order.customerId === customerId)
  }

  const getRestaurantOrders = (restaurantId) => {
    return orders.filter((order) => order.restaurantId === restaurantId)
  }

  const getCustomerLoyaltyPoints = (customerId) => {
    const customerOrders = orders.filter((order) => order.customerId === customerId && order.status === "delivered")
    return customerOrders.reduce((sum, order) => sum + order.loyaltyPoints, 0)
  }

  const addOrder = async (newOrder) => {
    const orderId = `ORD${Date.now()}`
    const order = { ...newOrder, id: orderId, createdAt: new Date() }
    setOrders([...orders, order])

    // Send order confirmation email
    if (newOrder.customerEmail && newOrder.restaurantName) {
      try {
        await sendOrderConfirmationEmail(newOrder.customerEmail, {
          orderId: orderId,
          restaurantName: newOrder.restaurantName,
          total: newOrder.totalPrice,
          estimatedTime: "30-45 mins"
        })
        toast.success("Order confirmation email sent!")
      } catch (error) {
        console.error("Failed to send order confirmation email:", error)
        // Don't block order if email fails
      }
    }

    return order
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

    // Send order status update email
    const order = orders.find(o => o.id === orderId)
    if (order && order.customerEmail) {
      try {
        await sendOrderStatusEmail(order.customerEmail, orderId, newStatus)
        toast.success(`Status update email sent!`)
      } catch (error) {
        console.error("Failed to send status update email:", error)
        // Don't block status update if email fails
      }
    }
  }

  const getRestaurantMenu = (restaurantId) => {
    return menuItems[restaurantId] || []
  }

  const updateMenuItem = (restaurantId, itemId, updatedData) => {
    setMenuItems((prev) => ({
      ...prev,
      [restaurantId]: prev[restaurantId].map((item) => (item.id === itemId ? { ...item, ...updatedData } : item)),
    }))
  }

  const addMenuItem = (restaurantId, newItem) => {
    setMenuItems((prev) => ({
      ...prev,
      [restaurantId]: [...(prev[restaurantId] || []), { ...newItem, id: `m${Date.now()}` }],
    }))
  }

  const deleteMenuItem = (restaurantId, itemId) => {
    setMenuItems((prev) => ({
      ...prev,
      [restaurantId]: prev[restaurantId].filter((item) => item.id !== itemId),
    }))
  }

  const getRestaurantStats = (restaurantId) => {
    const restOrders = orders.filter((order) => order.restaurantId === restaurantId)
    const totalRevenue = restOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    const pendingOrders = restOrders.filter((order) => order.status === "pending").length
    return {
      totalOrders: restOrders.length,
      totalRevenue,
      pendingOrders,
      completedOrders: restOrders.filter((order) => order.status === "delivered").length,
    }
  }

  const getAllRestaurants = () => {
    return restaurants
  }

  const getRestaurantById = (restaurantId) => {
    return restaurants.find((r) => r.id === restaurantId)
  }

  // Admin Functions
  const getAllOrders = () => {
    return orders.map((order) => {
      const restaurant = restaurants.find((r) => r.id === order.restaurantId)
      return {
        ...order,
        restaurantName: restaurant?.name || "Unknown",
        customerName: "Customer",
        total: order.totalPrice,
      }
    })
  }

  const getAllUsers = () => {
    return {
      customers: [
        { id: "cust1", name: "John Doe", email: "customer@demo.com", phone: "03001234567", role: "customer" },
        { id: "cust2", name: "Jane Smith", email: "jane@demo.com", phone: "03009876543", role: "customer" },
      ],
      restaurants: [
        {
          id: "rest_user1",
          name: "Ali Khan",
          email: "restaurant@demo.com",
          restaurantName: "Karachi Biryani House",
          role: "restaurant",
        },
        {
          id: "rest_user2",
          name: "Sara Ahmed",
          email: "italian@demo.com",
          restaurantName: "Italian Kitchen Express",
          role: "restaurant",
        },
      ],
    }
  }

  const approveRestaurant = async (restaurantId) => {
    const restaurant = restaurants.find(r => r.id === restaurantId)
    
    setRestaurants(
      restaurants.map((restaurant) =>
        restaurant.id === restaurantId ? { ...restaurant, status: "approved" } : restaurant,
      ),
    )

    // Send approval email
    if (restaurant && restaurant.email) {
      try {
        await sendRestaurantApprovalEmail(restaurant.email, restaurant.name, true)
        toast.success("Approval email sent!")
      } catch (error) {
        console.error("Failed to send approval email:", error)
      }
    }
  }

  const rejectRestaurant = (restaurantId) => {
    setRestaurants(restaurants.filter((restaurant) => restaurant.id !== restaurantId))
  }

  const suspendUser = (userId) => {
    // In real app, this would call backend API
    // User suspended functionality
  }

  const deleteUser = (userId) => {
    // In real app, this would call backend API
    // User deleted functionality
  }

  const value = {
    orders,
    menuItems,
    restaurants,
    getCustomerOrders,
    getRestaurantOrders,
    getCustomerLoyaltyPoints,
    addOrder,
    updateOrderStatus,
    getRestaurantMenu,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    getRestaurantStats,
    getAllRestaurants,
    getRestaurantById,
    // Admin functions
    getAllOrders,
    getAllUsers,
    approveRestaurant,
    rejectRestaurant,
    suspendUser,
    deleteUser,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
