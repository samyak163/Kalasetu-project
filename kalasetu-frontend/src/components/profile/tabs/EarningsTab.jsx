import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { LoadingState } from '../../ui';

const EarningsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      // Fetch real earnings from backend
      const response = await api.get('/api/payments/artisan/earnings');
      if (response.data.success) {
        setEarnings(response.data.data.summary || {});
        setTransactions(response.data.data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
      showToast(error.response?.data?.message || 'Failed to load earnings', 'error');
      setEarnings({});
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = () => {
    showToast('Withdrawal request submitted!', 'success');
  };

  if (loading) {
    return <LoadingState message="Loading earnings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your income and manage withdrawals
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Available Balance</div>
          <div className="text-3xl font-bold mb-4">₹{earnings?.availableBalance?.toLocaleString()}</div>
          <button 
            onClick={handleWithdrawal}
            className="px-4 py-2 bg-white text-green-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Withdraw Now
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">Pending Amount</div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">₹{earnings?.pendingAmount?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Will be available in 2-3 days</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">This Month</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">₹{earnings?.thisMonth?.toLocaleString()}</div>
          <div className="text-xs text-green-600">+15% from last month</div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Earned</div>
              <div className="text-2xl font-bold text-gray-900">₹{earnings?.totalEarned?.toLocaleString()}</div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Last Withdrawal</div>
              <div className="text-2xl font-bold text-gray-900">₹{earnings?.lastWithdrawal?.toLocaleString()}</div>
            </div>
            <div className="text-3xl">🏦</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        {transactions.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`p-4 flex items-center justify-between ${
                  index < transactions.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.date}</div>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTab;
