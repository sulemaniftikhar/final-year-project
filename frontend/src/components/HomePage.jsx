
import { useState } from "react"
import { useData } from "@/context/DataContext"
import { useAuth } from "@/context/AuthContext"
import RestaurantCard from "./RestaurantCard"

export default function HomePage({ onCustomerClick, onRestaurantClick, onLoginClick, onSignUpClick }) {
  const { getAllRestaurants } = useData()
  const { isAuthenticated } = useAuth()
  const restaurants = getAllRestaurants()
  const [selectedCuisine, setSelectedCuisine] = useState("All")
  const [isLoading, setIsLoading] = useState(false)

  const cuisines = ["All", ...new Set(restaurants.map((r) => r.cuisine))]
  const filteredRestaurants =
    selectedCuisine === "All" ? restaurants : restaurants.filter((r) => r.cuisine === selectedCuisine)

  const handleCustomerClick = () => {
    if (onCustomerClick) onCustomerClick()
  }

  const handleRestaurantClick = () => {
    if (onRestaurantClick) onRestaurantClick()
  }

  const handleRestaurantCardClick = (restaurantId) => {
    // Navigate to restaurant menu - can be enhanced later
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-accent text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Your Cravings, Delivered Fresh</h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Experience the best food ordering from your favorite restaurants. Fast, reliable, and always fresh!
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleCustomerClick}
              className="px-6 py-3 bg-white text-primary border-2 border-white rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md"
            >
              {isAuthenticated ? "Browse Restaurants" : "Order as Customer"}
            </button>
            <button
              onClick={handleRestaurantClick}
              className="px-6 py-3 bg-accent text-accent-foreground border-2 border-white rounded-lg font-semibold hover:bg-accent/90 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md"
            >
              Manage Restaurant
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cuisine Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Filter by Cuisine</h2>
          <div className="flex gap-2 flex-wrap">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${selectedCuisine === cuisine
                  ? "bg-primary text-primary-foreground"
                  : "bg-border text-foreground hover:bg-muted"
                  }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading restaurants...</p>
              </div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
              <p className="text-muted-foreground">Try selecting a different cuisine filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={handleRestaurantCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-accent text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-accent-foreground opacity-80">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-accent-foreground opacity-80">Partner Restaurants</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-accent-foreground opacity-80">Orders Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-accent-foreground opacity-80">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
