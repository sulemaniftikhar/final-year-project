
import { useState } from "react"
import { useData } from "@/context/DataContext"

export default function RestaurantMenu({ restaurantId, onOrder, onBack }) {
  const { getRestaurantById, getRestaurantMenu, getCustomerOrders } = useData()
  const restaurant = getRestaurantById(restaurantId)
  const menuItems = getRestaurantMenu(restaurantId)

  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground mb-4">Restaurant not found</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Get unique categories from menu items
  const categories = ["All", ...new Set(menuItems.map((item) => item.category))]

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === "All" ? menuItems : menuItems.filter((item) => item.category === selectedCategory)

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find((c) => c.id === item.id)
    if (existingItem) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter((c) => c.id !== itemId))
  }

  // Update quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map((c) => (c.id === itemId ? { ...c, quantity } : c)))
    }
  }

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Handle checkout (requires login)
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!")
      return
    }
    onOrder({
      restaurantId,
      items: cart,
      totalPrice: cartTotal,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all font-semibold"
          >
            ← Back to Restaurants
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg opacity-90 mb-2">{restaurant.description}</p>
              <div className="flex gap-4">
                <span className="flex items-center gap-1">⭐ {restaurant.rating}</span>
                <span className="flex items-center gap-1">📍 {restaurant.address}</span>
                <span className="flex items-center gap-1">📞 {restaurant.phone}</span>
              </div>
            </div>
            <img
              src={restaurant.image || "/placeholder.svg"}
              alt={restaurant.name}
              className="w-32 h-32 rounded-lg object-cover"
              onError={(e) => (e.target.src = "/placeholder.svg")}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Items Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-white text-foreground border-2 border-border hover:border-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-primary">Rs. {item.price}</span>
                        <span className="text-xs text-muted-foreground">Stock: {item.stock}</span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.stock === 0}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No items in this category</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Cart</h2>

              {cart.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-muted rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-destructive hover:opacity-70 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Rs. {item.price}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 bg-border rounded hover:bg-border/80 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-semibold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 bg-border rounded hover:bg-border/80 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <p className="text-right text-sm font-semibold text-primary mt-1">
                          Rs. {item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t-2 border-border pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground">Subtotal:</span>
                      <span className="font-bold">Rs. {cartTotal}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-foreground">Delivery:</span>
                      <span className="font-bold">Rs. 100</span>
                    </div>
                    <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-3 text-center mb-4">
                      <p className="text-sm opacity-90">Total:</p>
                      <p className="text-2xl font-bold">Rs. {cartTotal + 100}</p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-bold text-lg"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">Your cart is empty</p>
                  <p className="text-sm mt-2">Add items to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
