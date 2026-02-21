import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button } from './ui';

const ArtisanInfoModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-xl bg-white shadow-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 pr-8">Why Join KalaSetu as an Artisan?</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span>Reach customers across India</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span>Professional portfolio showcase</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span>Secure booking & payment system</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span>Build your reputation with reviews</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span>Flexible scheduling tools</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span>No commission fees for first 3 months</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="primary" className="flex-1" onClick={() => { onClose(); navigate('/artisan/register'); }}>
            Get Started
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtisanInfoModal;


