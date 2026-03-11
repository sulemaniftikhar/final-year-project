import React, { useState } from 'react';
import { Plus, Minus, Flame, Sparkles, Star } from 'lucide-react';
import { useCart } from '../../features/customer/CartContext';

const DishCard = ({ dish, restaurantName, restaurantId }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();

  // Find if item is in cart
  const cartItem = cartItems.find(item => item.id === dish.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const {
    name,
    description,
    price,
    image,
    badge,
  } = dish;

  const badgeColors = {
    'Bestseller': 'bg-orange-100 text-orange-800',
    'New': 'bg-green-100 text-green-800',
    'Spicy': 'bg-red-100 text-red-800',
  };

  const handleAdd = () => {
    addToCart({ ...dish, restaurantId }, { id: restaurantId, name: restaurantName });
  };

  const handleIncrement = () => {
    updateQuantity(dish.id, 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(dish.id, -1);
    } else {
      removeFromCart(dish.id);
    }
  };

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-center px-3 text-sm font-bold text-primary-700 leading-tight line-clamp-3">
              {name}
            </span>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeColors[badge]}`}>
              {badge === 'Spicy' ? <Flame className="w-3 h-3 inline mr-1" /> : null}
              {badge === 'New' ? <Sparkles className="w-3 h-3 inline mr-1" /> : null}
              {badge === 'Bestseller' ? <Star className="w-3 h-3 inline mr-1" /> : null}
              {badge}
            </span>
          </div>
        )}

        {/* In Cart Pill */}
        {quantity > 0 && (
          <div className="absolute bottom-3 left-3">
            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold rounded-full shadow-sm flex items-center space-x-2">
              <span>In cart • {quantity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Price Row */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 truncate flex-1 mr-2">
            {name}
          </h3>
          <span className="font-bold text-gray-900 whitespace-nowrap">
            {price}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
          {description}
        </p>

        {/* CTA Button */}
        <div className="flex items-center justify-between">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="font-bold text-gray-900">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Customize Button (only shows on hover for items with modifiers) */}
          {isHovered && (
            <button className="ml-2 px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Customize
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;