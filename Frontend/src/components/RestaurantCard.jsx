
export default function RestaurantCard({ restaurant, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(restaurant.id)
    }
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {/* Restaurant Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = "none"
          }}
        />
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-1">{restaurant.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{restaurant.cuisine}</p>
        <p className="text-sm text-muted-foreground mb-3">{restaurant.address}</p>

        {/* Rating and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-foreground">{restaurant.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">{restaurant.totalOrders} orders</span>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Order Now
        </button>
      </div>
    </div>
  )
}
