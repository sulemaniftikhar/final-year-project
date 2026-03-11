import React from 'react';
import { Shield, Clock, TrendingUp, Star } from 'lucide-react';

const TrustSection = () => {
  const stats = [
    {
      value: '12 sec',
      label: 'Avg reorder time',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      value: '99.9%',
      label: 'Uptime',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      value: 'Secure',
      label: 'Payments',
      icon: Shield,
      color: 'bg-purple-500',
    },
    {
      value: '4.8',
      label: 'Avg rating',
      icon: Star,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-content mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Why restaurants and customers choose OrderIQ
            </h2>
            <p className="text-neutral-600 mb-8">
              We've built a platform that works for everyone. Restaurants increase efficiency 
              while customers enjoy a seamless ordering experience.
            </p>
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Learn more about OrderIQ
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-neutral-50 rounded-xl p-6">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-neutral-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;