import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';

const Filters = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const location = useLocation();

  const cuisines = [
    'Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese',
    'American', 'Thai', 'Mediterranean', 'Korean', 'Vietnamese',
    'Middle Eastern', 'French', 'Spanish', 'Greek', 'Lebanese'
  ];

  
  const sortOptions = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'rating', label: 'Rating' },
    { id: 'fastest', label: 'Fastest Delivery' },
    { id: 'price', label: 'Price' },
  ];

 
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById('hero')?.offsetHeight || 600;
      setIsSticky(window.scrollY > heroHeight - 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // initialize from URL
    const params = new URLSearchParams(location.search);
    const cuisineParam = params.get('cuisine');
    if (cuisineParam) {
      const parts = cuisineParam.split(',').map(s => s.trim()).filter(Boolean);
      setSelectedCuisines(parts.slice(0, 3));
    } else {
      setSelectedCuisines([]);
    }
  }, [location.search]);

  const handleCuisineSelect = (cuisine) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setActiveFilters([]);
    const url = new URL(window.location.href);
    url.searchParams.delete('cuisine');
    window.history.replaceState({}, '', url);
  };

  return (
    <div 
      className={`transition-all duration-300 ${
        isSticky 
          ? 'fixed top-18 left-0 right-0 z-40 bg-white shadow-lg border-b border-neutral-200' 
          : 'relative'
      }`}
    >
      <div className="max-w-content mx-auto px-6">
        <div className="py-4">
          {/* Desktop Filters */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-wrap">
              {/* Cuisine Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowCuisineDropdown(!showCuisineDropdown)}
                  className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400"
                >
                  <span>Cuisine</span>
                  <ChevronDown className="ml-2 w-4 h-4" />
                  {selectedCuisines.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">
                      {selectedCuisines.length}
                    </span>
                  )}
                </button>

                {showCuisineDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowCuisineDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 z-40 p-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-neutral-900 mb-2">Select Cuisines</h4>
                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                          {cuisines.map((cuisine) => (
                            <button
                              key={cuisine}
                              onClick={() => handleCuisineSelect(cuisine)}
                              className={`px-3 py-1.5 text-sm rounded-lg ${
                                selectedCuisines.includes(cuisine)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              {cuisine}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-neutral-200 pt-4">
                        <button
                          onClick={() => setSelectedCuisines([])}
                          className="text-sm text-neutral-500 hover:text-neutral-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => {
                            const url = new URL(window.location.href);
                            if (selectedCuisines.length > 0) {
                              url.searchParams.set('cuisine', selectedCuisines.join(','));
                            } else {
                              url.searchParams.delete('cuisine');
                            }
                            window.history.replaceState({}, '', url);
                            setShowCuisineDropdown(false);
                          }}
                          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Rating Filter 
              <div className="flex items-center space-x-2">
                {ratings.map((rating) => (
                  <button
                    key={rating.value}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400"
                  >
                    {rating.label}
                  </button>
                ))}
              </div>*/}

              {/* Price Filter 
              <div className="flex items-center space-x-2">
                {priceRanges.map((price) => (
                  <button
                    key={price.value}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400"
                  >
                    {price.value}
                  </button>
                ))}
              </div>*/}

              {/* Dietary Filter 
              <div className="flex items-center space-x-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option.id}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400"
                  >
                    {option.label}
                  </button>
                ))}
              </div>*/}

              {/* Clear All Button */}
              {selectedCuisines.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select className="appearance-none px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10">
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    Sort by: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {selectedCuisines.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                      {selectedCuisines.length}
                    </span>
                  )}
                </button>
                
                <select className="px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400">
                  <option>Sort: Recommended</option>
                  <option>Sort: Rating</option>
                  <option>Sort: Fastest</option>
                  <option>Sort: Price</option>
                </select>
              </div>

              {selectedCuisines.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {selectedCuisines.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCuisines.map((cuisine) => (
                <div
                  key={cuisine}
                  className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg"
                >
                  <span className="text-sm">{cuisine}</span>
                  <button
                    onClick={() => setSelectedCuisines(prev => prev.filter(c => c !== cuisine))}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
