import React from 'react';
import { ArrowRight, QrCode } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-500 to-accent-500">
      <div className="max-w-content mx-auto px-6">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to order?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and restaurants using OrderIQ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 hover:bg-neutral-100 font-bold rounded-xl text-lg">
              Find restaurants
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl text-lg">
              <QrCode className="mr-2 w-5 h-5" />
              Scan QR
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;