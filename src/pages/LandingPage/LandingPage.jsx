import React from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import Hero from '../../components/sections/Hero/Hero';
import Filters from '../../components/sections/Filters/Filters';
import RestaurantGrid from '../../components/sections/RestaurantGrid/RestaurantGrid';
import Features from '../../components/sections/Features/Features';
import TrustSection from '../../components/sections/Trust/TrustSection';
import CTASection from '../../components/sections/CTA/CTASection';
import Footer from '../../components/layout/Footer/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
     {/* <div id="hero">*/}
        <Hero />
      {/*</div>*/}

      {/* Filters Bar */}
      <Filters />

      {/* Restaurant Grid */}
      <RestaurantGrid />

      {/* Features Section */}
      <Features />

      {/* Trust Section */}
      <TrustSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;