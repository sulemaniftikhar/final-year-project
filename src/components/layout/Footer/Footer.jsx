import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: 'Discovery', href: '#' },
      { label: 'Order Tracking', href: '#' },
      { label: 'Loyalty Rewards', href: '#' },
      { label: 'QR Menus', href: '#' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
    ],
    Partner: [
      { label: 'For Restaurants', href: '#' },
      { label: 'Partner Portal', href: '#' },
      { label: 'Support Center', href: '#' },
      { label: 'API Docs', href: '#' },
    ],
    Legal: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
    ],
  };

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OQ</span>
              </div>
              <span className="text-2xl font-bold">OrderIQ</span>
            </div>
            <p className="text-neutral-400 text-sm">
              AI-powered food delivery platform connecting restaurants with customers seamlessly.
            </p>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-lg mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
          <p>© 2024 OrderIQ. All rights reserved. Made with ❤️ for food lovers worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
