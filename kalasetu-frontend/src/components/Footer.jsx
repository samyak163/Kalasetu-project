import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="text-3xl font-bold text-white">
              Kala<span className="text-[#A55233]">Setu</span>
            </Link>
            <p className="text-gray-400 text-base">
              Connecting you with the heart of craftsmanship. Discover unique, handmade products from local artisans.
            </p>
            <div className="flex space-x-6">
              {/* Social links can be added here, e.g., <Icons.twitter /> */}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Discover</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/" className="text-base text-gray-400 hover:text-white">Home</Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">For Artisans</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/artisan/login" className="text-base text-gray-400 hover:text-white">Artisan Login</Link>
                  </li>
                  <li>
                    <Link to="/artisan/register" className="text-base text-gray-400 hover:text-white">Join as Artisan</Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-base text-gray-400 hover:text-white">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-base text-gray-400 hover:text-white">Terms & Conditions</Link>
                  </li>
                  <li>
                    <Link to="/shipping" className="text-base text-gray-400 hover:text-white">Shipping Policy</Link>
                  </li>
                  <li>
                    <Link to="/refunds" className="text-base text-gray-400 hover:text-white">Cancellation & Refund</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- BOTTOM SECTION --- */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} KalaSetu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

