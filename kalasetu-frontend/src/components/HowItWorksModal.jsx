import React from 'react';

const HowItWorksModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 pr-8">How KalaSetu Works</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#A55233] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Browse Artisans
              </h3>
              <p className="text-gray-600">
                Search by category, location, or browse featured artisans in your area.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#A55233] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                View Profiles & Reviews
              </h3>
              <p className="text-gray-600">
                Check out portfolios, read reviews, and compare artisans to find the perfect match.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#A55233] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Book Services
              </h3>
              <p className="text-gray-600">
                Choose your date and time, provide details, and book directly through the platform.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#A55233] text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Stay Connected
              </h3>
              <p className="text-gray-600">
                Chat with artisans, schedule video calls, and track your bookings in one place.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#A55233] text-white rounded-full flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Pay Securely
              </h3>
              <p className="text-gray-600">
                Complete payment through our secure platform after your service is delivered.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button at Bottom */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-[#A55233] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#8e462b] transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;


