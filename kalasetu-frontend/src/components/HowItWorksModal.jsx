import React from 'react';

const HowItWorksModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-100">✕</button>
          </div>
          <div className="px-6 py-5 space-y-3 text-gray-700">
            <div>• Step 1: Browse artisans by category or location</div>
            <div>• Step 2: View profiles, portfolios, and reviews</div>
            <div>• Step 3: Book services directly through the platform</div>
            <div>• Step 4: Communicate via integrated chat/video</div>
            <div>• Step 5: Complete payment securely</div>
          </div>
          <div className="px-6 pb-6 text-sm text-gray-500">Icons/illustrations coming soon.</div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;


