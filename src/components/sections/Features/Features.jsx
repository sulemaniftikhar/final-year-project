import React from 'react';
import { Truck, Package, QrCode } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Truck,
      title: 'Track every step',
      description: 'Real-time tracking from kitchen to doorstep with live updates.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Package,
      title: 'Skip the wait',
      description: 'Order ahead and pick up without waiting in line.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: QrCode,
      title: 'Scan QR, order at your table',
      description: 'Browse menu, order, and pay directly from your phone.',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-content mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Order your way
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Whether you're at home, on the go, or dining out, OrderIQ adapts to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-neutral-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600">
                {feature.description}
              </p>
              <a href="#" className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium">
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;