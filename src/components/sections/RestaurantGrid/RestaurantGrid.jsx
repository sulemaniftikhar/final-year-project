import React, { useEffect, useMemo, useState } from 'react';
import { Star, Clock, MapPin, Check, Truck, Package, Utensils } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { restaurantService } from '../../../services/restaurant.service';

const RestaurantGrid = () => {
  const location = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [showMapView, setShowMapView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const search = sp.get('search') || '';
    const cuisine = sp.get('cuisine') || '';
    const type = sp.get('type') || '';
    return { search, cuisine, type };
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const query = {};
        if (params.search) query.search = params.search;
        if (params.cuisine) {
          // backend expects single cuisine value; pass first if multiple
          query.cuisine = params.cuisine.split(',')[0];
        }
        if (params.type) query.type = params.type;
        const res = await restaurantService.getAllRestaurants(query);
        const list = res.data || [];
        const mapped = list.map(r => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisineTypes || [],
          rating: r.rating || 0,
          reviewCount: r.reviewCount || 0,
          deliveryTime: '25-35 min',
          pickupTime: '15-20 min',
          deliveryFee: r.deliveryFee ? `PKR ${Math.round(r.deliveryFee)}` : 'PKR 0',
          priceRange: r.priceRange || '$$',
          image: r.coverImage || r.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
          modes: [
            r.delivery ? 'delivery' : null,
            r.takeaway ? 'pickup' : null,
            r.dineIn ? 'dinein' : null
          ].filter(Boolean),
          promoted: r.promoted || false
        }));
        setRestaurants(mapped);
      } catch (e) {
        console.error(e);
        setError('Failed to load restaurants');
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params]);

  const modeIcons = {
    delivery: { icon: Truck, label: 'Delivery' },
    pickup: { icon: Package, label: 'Pickup' },
    dinein: { icon: Utensils, label: 'Dine-in' },
  };

  return (
    <section id="restaurants" className="py-12 bg-white">
      <div className="max-w-content mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Restaurants near you
            </h2>
            <p className="text-neutral-500 mt-2">
              Delivery • Showing {restaurants.length} results
            </p>
          </div>

          <button
            onClick={() => setShowMapView(!showMapView)}
            className="mt-4 md:mt-0 px-4 py-2 border border-neutral-300 rounded-lg hover:border-neutral-400 text-neutral-700"
          >
            {showMapView ? 'List view' : 'Map view'}
          </button>
        </div>

        {/* Restaurant Grid */}
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {error}
            </h3>
            <p className="text-neutral-500 mb-6">
              Try adjusting your filters or reloading the page.
            </p>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                to={`/customer/restaurant/${restaurant.id}`}
                key={restaurant.id}
                className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-xl transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                  {/* Promoted Badge */}
                  {restaurant.promoted && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs font-semibold rounded-full">
                        PROMOTED
                      </span>
                    </div>
                  )}



                  {/* View Menu Button (on hover) */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg shadow-lg">
                      View menu
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 truncate">
                        {restaurant.name}
                      </h3>

                      {/* Cuisine Chips */}
                      <div className="flex items-center gap-1 mt-2">
                        {restaurant.cuisine.slice(0, 2).map((cuisine, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded"
                          >
                            {cuisine}
                          </span>
                        ))}
                        {restaurant.cuisine.length > 2 && (
                          <span className="text-xs text-neutral-400">
                            +{restaurant.cuisine.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-green-600 fill-current" />
                      <span className="ml-1 font-bold text-green-700">{restaurant.rating}</span>
                      <span className="ml-1 text-xs text-neutral-500">({restaurant.reviewCount})</span>
                    </div>
                  </div>

                  {/* Mode Availability */}
                  <div className="flex items-center gap-2 mb-4">
                    {restaurant.modes.map((mode) => {
                      const ModeIcon = modeIcons[mode].icon;
                      return (
                        <span
                          key={mode}
                          className="flex items-center gap-1 px-2 py-1 bg-neutral-50 text-neutral-600 text-xs rounded"
                        >
                          <ModeIcon className="w-3 h-3" />
                          {modeIcons[mode].label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Service Info */}
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                    <div className="text-neutral-500">
                      {restaurant.deliveryFee} delivery fee
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No restaurants match your filters
            </h3>
            <p className="text-neutral-500 mb-6">
              Try adjusting your filters to see more results
            </p>
            <div />
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantGrid;
