import React from 'react';
import { Link } from 'react-router-dom';

const ArtisanInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Why Join KalaSetu as an Artisan?</h2>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-100">✕</button>
          </div>
          <div className="px-6 py-5">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Reach users across your region</li>
              <li>Professional portfolio showcase</li>
              <li>Secure booking & payment system</li>
              <li>Build your reputation with reviews</li>
              <li>Flexible scheduling tools</li>
              <li>No commission fees for first 3 months</li>
            </ul>
          </div>
          <div className="px-6 pb-6 flex items-center gap-3">
            <Link to="/artisan/login" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-[#A55233] hover:bg-[#8e462b] transition-colors">Get Started</Link>
            <Link to="/artisan/info" className="text-[#A55233] hover:underline">Learn More</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanInfoModal;


