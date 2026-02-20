import { useState, useEffect } from 'react';
import { Card, FilterChips, Skeleton } from '../ui';
import { TrendingUp } from 'lucide-react';
import api from '../../lib/axios.js';

/**
 * Pure CSS bar chart for income visualization.
 * Fetches data from /api/artisan/dashboard/income-report.
 *
 * @param {number} months - Number of months to show (6 or 12)
 * @param {string} className - Additional classes
 */
export default function IncomeChart({ months = 6, className = '' }) {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stale = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/artisan/dashboard/income-report?period=${period}`);
        if (!stale && res.data.success) setData(res.data.data);
      } catch {
        if (!stale) setData({ periods: [], total: 0 });
      } finally {
        if (!stale) setLoading(false);
      }
    };
    fetchData();
    return () => { stale = true; };
  }, [period]);

  const periods = data?.periods?.slice(-months) || [];
  const visibleTotal = periods.reduce((sum, p) => sum + p.amount, 0);
  const maxAmount = Math.max(...periods.map(p => p.amount), 1);

  const formatLabel = (label) => {
    if (period === 'monthly') {
      // "2026-02" -> "Feb"
      const [, month] = label.split('-');
      return new Date(2026, parseInt(month) - 1).toLocaleString('en-IN', { month: 'short' });
    }
    // "2026-W08" -> "W8"
    return label.replace(/^\d{4}-W0?/, 'W');
  };

  const chips = [
    { key: 'monthly', label: 'Monthly', active: period === 'monthly', onClick: () => setPeriod('monthly') },
    { key: 'weekly', label: 'Weekly', active: period === 'weekly', onClick: () => setPeriod('weekly') },
  ];

  if (loading) {
    return (
      <Card className={className}>
        <Skeleton variant="rect" height="200px" />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success-600" />
          <h3 className="text-sm font-semibold text-gray-900">Income Overview</h3>
        </div>
        <FilterChips chips={chips} />
      </div>

      {visibleTotal > 0 && (
        <p className="text-2xl font-bold text-gray-900 mb-4">
          ₹{visibleTotal.toLocaleString('en-IN')}
        </p>
      )}

      {periods.length > 0 ? (
        <div className="flex items-end gap-1 h-32">
          {periods.map((p) => (
            <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium">
                {p.amount > 0 ? `₹${(p.amount / 1000).toFixed(0)}k` : ''}
              </span>
              <div
                className="w-full bg-brand-100 rounded-t-sm transition-all duration-300 min-h-[4px]"
                style={{ height: `${Math.max((p.amount / maxAmount) * 100, 3)}%` }}
              >
                <div
                  className="w-full h-full bg-brand-500 rounded-t-sm"
                  style={{ opacity: p.amount > 0 ? 1 : 0.3 }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{formatLabel(p.label)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">No income data yet</p>
      )}
    </Card>
  );
}
