import { useState } from "react"
import { useData } from "@/context/DataContext"
import { useAuth } from "@/context/AuthContext"
import { Icon } from "@iconify/react"

export default function HomePage({ onCustomerClick, onRestaurantClick, onLoginClick, onSignUpClick, searchQuery = "", onSearchChange }) {
  const { getAllRestaurants } = useData()
  const { isAuthenticated } = useAuth()
  const restaurants = getAllRestaurants()
  const [selectedCuisine, setSelectedCuisine] = useState("All")

  const cuisineEmojis = {
    "All": "🍽️",
    "Pakistani": "🍛",
    "Indian": "🍛",
    "Chinese": "🍜",
    "Italian": "🍕",
    "Thai": "🍲",
    "Fast Food": "🍔"
  }

  const cuisines = ["All", ...new Set(restaurants.map((r) => r.cuisine))]

  // Filter by cuisine first
  let filteredRestaurants = selectedCuisine === "All" ? restaurants : restaurants.filter((r) => r.cuisine === selectedCuisine)

  // Then filter by search query if provided
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filteredRestaurants = filteredRestaurants.filter((r) =>
      r.name.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query))
    )
  }

  const handleCustomerClick = () => {
    if (onCustomerClick) onCustomerClick()
  }

  const handleRestaurantClick = () => {
    if (onRestaurantClick) onRestaurantClick()
  }

  const handleRestaurantCardClick = (restaurantId) => {
    // Navigate to customer dashboard to view restaurant menu
    if (onCustomerClick) onCustomerClick()
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl min-h-[500px] flex items-center justify-start bg-gradient-to-r from-black/90 via-black/70 to-transparent">
          {/* Background with Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-card to-background">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full md:w-2/3 lg:w-1/2 mr-auto px-6 sm:px-12 py-12 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 w-fit">
              <span className="flex size-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary text-xs font-bold uppercase tracking-wider">Now Delivering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Craving satisfied <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">in minutes.</span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl font-normal max-w-md leading-relaxed">
              The best local restaurants delivered to your doorstep. Fresh, fast, and ready to eat.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleCustomerClick}
                className="h-14 px-8 rounded-full bg-primary text-primary-foreground text-base font-bold hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(43,238,121,0.4)] flex items-center gap-2"
              >
                <span>{isAuthenticated ? "Browse Restaurants" : "Order Now"}</span>
                <Icon icon="lucide:arrow-right" className="text-xl" />
              </button>
              <button
                onClick={handleRestaurantClick}
                className="h-14 px-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-base font-bold hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <span>Partner with Us</span>
                <Icon icon="lucide:store" className="text-xl" />
              </button>
            </div>
          </div>

          {/* Hero Image/Decoration */}
          <div className="hidden lg:flex absolute right-12 z-10 w-1/3 h-full items-center justify-center">
            <div className="relative w-full max-w-sm aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-center h-full">
                <Icon icon="lucide:utensils-crossed" className="text-primary/30 w-48 h-48 lg:w-64 lg:h-64" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Cuisine Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Explore Cuisines</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`shrink-0 h-12 px-6 rounded-full font-bold text-sm transition-all flex items-center gap-2 group ${selectedCuisine === cuisine
                ? "bg-primary text-primary-foreground shadow-[0_4px_10px_rgba(43,238,121,0.2)]"
                : "bg-card text-foreground border border-border hover:border-primary"
                }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {cuisineEmojis[cuisine] || "🍽️"}
              </span>
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Popular Restaurants</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredRestaurants.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
              <p className="text-muted-foreground">Try selecting a different cuisine filter</p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantCardClick(restaurant.id)}
                className="group relative flex flex-col gap-4 bg-card rounded-3xl p-3 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-xl cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <Icon icon="lucide:utensils" className="text-6xl text-primary/50" />
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-background text-xs font-bold shadow-lg">
                      25-35 min
                    </span>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold truncate pr-4">{restaurant.name}</h3>
                    <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/30">
                      <span className="text-primary text-sm font-bold">{restaurant.rating}</span>
                      <Icon icon="lucide:star" className="text-primary text-sm fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>{restaurant.cuisine}</span>
                    <span className="size-1 rounded-full bg-muted-foreground"></span>
                    <span>{restaurant.totalOrders} orders</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Icon icon="lucide:bike" className="text-base" />
                      <span>Free Delivery</span>
                    </div>
                    <button className="text-xs font-bold text-primary hover:text-white transition-colors">
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-6 max-w-xl text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight">
              Get 50% off your first order
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of foodies and start exploring the best tastes in your city. Use code{" "}
              <span className="text-primary font-bold">ORDERIQ50</span> at checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={handleCustomerClick}
                className="h-14 px-8 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(43,238,121,0.3)] whitespace-nowrap"
              >
                Start Ordering
              </button>
              {!isAuthenticated && (
                <button
                  onClick={onSignUpClick}
                  className="h-14 px-8 rounded-xl bg-accent text-accent-foreground text-base font-bold hover:brightness-110 transition-all whitespace-nowrap"
                >
                  Sign Up Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-3xl md:text-4xl font-black text-primary mb-1">10k+</span>
              <span className="text-sm text-muted-foreground font-medium">Daily Orders</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-3xl md:text-4xl font-black text-primary mb-1">{restaurants.length}+</span>
              <span className="text-sm text-muted-foreground font-medium">Restaurants</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-3xl md:text-4xl font-black text-primary mb-1">30m</span>
              <span className="text-sm text-muted-foreground font-medium">Avg Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-3xl md:text-4xl font-black text-primary mb-1">4.9</span>
              <span className="text-sm text-muted-foreground font-medium">App Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 flex flex-col gap-4 pr-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Icon icon="lucide:bar-chart-2" className="text-primary-foreground text-xl" />
                </div>
                <span className="text-xl font-bold tracking-tight">OrderIQ</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Ordering food should be as easy as eating it. We connect you with the best local restaurants for delivery or pickup.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-foreground">Company</h4>
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">About Us</a>
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Careers</a>
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Blog</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-foreground">Support</h4>
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Help Center</a>
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Safety</a>
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Contact</a>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2024 OrderIQ Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</span>
              <span className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
