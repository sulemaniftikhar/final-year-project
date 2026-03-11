import React from 'react';
import { Star, Clock, Truck, Package, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant, mode = 'delivery' }) => {
  const {
    name,
    rating,
    cuisines,
    deliveryTime,
    pickupTime,
    deliveryFee,
    priceRange,
    image,
    promoted,
  } = restaurant;

  const modeIcons = {
    delivery: { icon: Truck, label: 'Delivery' },
    pickup: { icon: Package, label: 'Pickup' },
    dinein: { icon: Utensils, label: 'Dine-in' },
  };

  return (
    <Link
      to={`/customer/restaurant/${restaurant.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-300 block"
    >
      {/* Image Container */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Promoted Badge */}
        {promoted && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs font-semibold rounded-full">
              PROMOTED
            </span>
          </div>
        )}



        {/* View Menu Button (on hover) */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg shadow-lg">
            View menu
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {name}
            </h3>

            {/* Cuisine Chips */}
            <div className="flex items-center gap-1 mt-2">
              {cuisines.slice(0, 2).map((cuisine, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {cuisine}
                </span>
              ))}
              {cuisines.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{cuisines.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-green-600 fill-current" />
            <span className="ml-1 font-bold text-green-700">{rating}</span>
          </div>
        </div>

        {/* Mode Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {mode === 'delivery' ? deliveryTime : pickupTime}
          </div>
          <div className="text-gray-500">
            {mode === 'delivery' ? `${deliveryFee} delivery fee` : 'Ready for pickup'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;