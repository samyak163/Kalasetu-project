import { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { Card, Skeleton, EmptyState } from '../../ui';
import IncomeChart from '../../dashboard/IncomeChart.jsx';
import { Wallet, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, Banknote } from 'lucide-react';

const EarningsTab = () => {
  const { showToast } = useContext(ToastContext);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEarnings(); }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments/artisan/earnings');
      if (res.data.success) {
        setEarnings(res.data.data.summary || {});
        setTransactions(res.data.data.transactions || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load earnings', 'error');
      setEarnings({});
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rect" height="28px" width="200px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} variant="rect" height="100px" />)}
        </div>
        <Skeleton variant="rect" height="200px" />
      </div>
    );
  }

  const balanceCards = [
    { label: 'Available Balance', value: earnings?.availableBalance, icon: Wallet, color: 'text-success-600', bg: 'bg-success-50', subtitle: null },
    { label: 'Pending Amount', value: earnings?.pendingAmount, icon: Clock, color: 'text-warning-600', bg: 'bg-warning-50', subtitle: 'Available in 2-3 days' },
    { label: 'This Month', value: earnings?.thisMonth, icon: TrendingUp, color: 'text-brand-500', bg: 'bg-brand-50', subtitle: null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900">Earnings & Payouts</h2>
        <p className="text-sm text-gray-500 mt-1">Track your income and payment history</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balanceCards.map(({ label, value, icon: Icon, color, bg, subtitle }) => (
          <Card key={label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(value || 0).toLocaleString('en-IN')}
                </p>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Total earned summary */}
      <Card hover={false}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Earned (Lifetime)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₹{(earnings?.totalEarned || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-success-50 rounded-lg">
            <Banknote className="h-6 w-6 text-success-600" />
          </div>
        </div>
      </Card>

      {/* Income chart — 12 months */}
      <IncomeChart months={12} />

      {/* Transaction history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction History</h3>
        {transactions.length > 0 ? (
          <Card hover={false} padding={false}>
            <div className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <div key={tx._id || tx.paymentId} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'credit' || tx.status === 'captured' ? 'bg-success-50' : 'bg-error-50'}`}>
                      {tx.type === 'credit' || tx.status === 'captured'
                        ? <ArrowDownLeft className="h-4 w-4 text-success-600" />
                        : <ArrowUpRight className="h-4 w-4 text-error-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description || 'Payment received'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'credit' || tx.status === 'captured' ? 'text-success-600' : 'text-error-600'}`}>
                    {tx.type === 'credit' || tx.status === 'captured' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<Banknote className="h-12 w-12" />}
            title="No transactions yet"
            description="Completed bookings will appear here as payments"
          />
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-gray-400 text-center">
        Payments are processed via Razorpay and deposited to your linked account.
      </p>
    </div>
  );
};

export default EarningsTab;
