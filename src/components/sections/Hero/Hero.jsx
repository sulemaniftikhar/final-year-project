import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, Clock, Shield, QrCode } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredCards, setFeaturedCards] = useState([
    { id: 1, name: 'Spice Symphony', rating: 4.8, cuisine: 'Indian • North Indian', prepTime: '25-30 min', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
    { id: 2, name: 'Tokyo Sushi Bar', rating: 4.7, cuisine: 'Japanese • Sushi', prepTime: '30-40 min', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop' },
    { id: 3, name: 'La Pasta Fresca', rating: 4.5, cuisine: 'Italian • Pasta', prepTime: '20-25 min', image: 'https://images.unsplash.com/photo-1551183053-bf91b1d5ae5a?w=400&h=300&fit=crop' },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const trustMetrics = [
    { value: '4.8', label: 'avg rating', icon: Star },
    { value: '500+', label: 'restaurants', icon: '' },
    { value: '14 min', label: 'avg prep time', icon: Clock },
    { value: 'Secure', label: 'payments', icon: Shield },
  ];

  return (
    <section className="pt-24 pb-20 md:pt-32 md:pb-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-content mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: Value Prop & CTAs */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
              Order smarter across{' '}
              <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 bg-clip-text text-transparent">
                delivery, pickup, and dine‑in
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl">
              Discover great food, reorder instantly, and track every order—while restaurants run operations faster.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => {
                  const el = document.getElementById('restaurants');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate('/customer/home');
                  }
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl">
                Find restaurants
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('restaurants');
                  if (el) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('type', 'dinein');
                    window.history.replaceState({}, '', url);
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate('/customer/home?type=dinein');
                  }
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors">
                <QrCode className="mr-2 w-5 h-5" />
                Scan QR for dine‑in
              </button>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap items-center gap-6">
              {trustMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {metric.icon && <metric.icon className="w-4 h-4 text-success" />}
                  <div>
                    <span className="font-bold text-neutral-900">{metric.value}</span>
                    <span className="text-sm text-neutral-500 ml-1">{metric.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Featured Cards */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Featured Card */}
              <div
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform rotate-1 transition-transform duration-300 hover:rotate-0"
                style={{ animationDelay: '200ms' }}
              >
                <div className="relative">
                  <img
                    src={featuredCards[0].image}
                    alt={featuredCards[0].name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">{featuredCards[0].name}</h3>
                      <p className="text-neutral-500">{featuredCards[0].cuisine}</p>
                    </div>
                    <div className="flex items-center bg-green-50 px-3 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-green-600 fill-current" />
                      <span className="ml-1 font-bold text-green-700">{featuredCards[0].rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-500">
                      <Clock className="inline w-4 h-4 mr-1" />
                      {featuredCards[0].prepTime}
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById('restaurants');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                          navigate('/customer/home');
                        }
                      }}
                      className="text-primary-600 hover:text-primary-700 font-semibold">
                      View menu →
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 w-64 transform -rotate-2"
                style={{ animationDelay: '400ms' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={featuredCards[1].image} alt={featuredCards[1].name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{featuredCards[1].name}</h4>
                    <p className="text-sm text-neutral-500">{featuredCards[1].cuisine}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium ml-1">{featuredCards[1].rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 w-64 transform rotate-2"
                style={{ animationDelay: '600ms' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={featuredCards[2].image} alt={featuredCards[2].name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{featuredCards[2].name}</h4>
                    <p className="text-sm text-neutral-500">{featuredCards[2].cuisine}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium ml-1">{featuredCards[2].rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-neutral-900">Avg prep time: 14 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
