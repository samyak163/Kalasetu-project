import { useState } from 'react';
import PaymentHistory from '../components/Payment/PaymentHistory.jsx';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('sent');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent Payments
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'received'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Received Payments
          </button>
        </div>
      </div>

      {/* Payment History */}
      <PaymentHistory type={activeTab} />
    </div>
  );
}
