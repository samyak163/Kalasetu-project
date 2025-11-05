import React from 'react';

const Support = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
      <div className="space-y-3">
        <details className="border rounded p-3">
          <summary className="font-semibold">How do I book an artisan?</summary>
          <p className="text-gray-700 mt-2">Browse categories, open an artisan profile, and click Book.</p>
        </details>
        <details className="border rounded p-3">
          <summary className="font-semibold">How do payments work?</summary>
          <p className="text-gray-700 mt-2">Payments are processed securely via our payment gateway.</p>
        </details>
        <details className="border rounded p-3">
          <summary className="font-semibold">Can I cancel a booking?</summary>
          <p className="text-gray-700 mt-2">Yes, per our refund policy timelines.</p>
        </details>
      </div>
    </div>
  );
};

export default Support;


