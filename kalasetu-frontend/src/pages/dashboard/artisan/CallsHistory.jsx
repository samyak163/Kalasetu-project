import React, { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import EmptyState from '../../../components/ui/EmptyState';
import LoadingState from '../../../components/ui/LoadingState';
import Badge from '../../../components/ui/Badge';

export default function CallsHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/calls/history', { withCredentials: true });
        setList(res.data?.data || []);
      } catch (_) {
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Call History</h1>
        <LoadingState message="Loading call history..." />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Call History</h1>
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          title="No call history yet"
          description="Your video call history will appear here once you start making or receiving calls."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Call History</h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50">
            <tr>
              <th className="p-3 text-left font-semibold text-brand-800">Started</th>
              <th className="p-3 text-left font-semibold text-brand-800">Duration</th>
              <th className="p-3 text-left font-semibold text-brand-800">Type</th>
              <th className="p-3 text-left font-semibold text-brand-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => (
              <tr key={it._id} className="border-t border-gray-100 hover:bg-brand-50/50 transition-colors">
                <td className="p-3">{new Date(it.startedAt).toLocaleString()}</td>
                <td className="p-3">{Math.round((it.durationSec || 0) / 60)} min</td>
                <td className="p-3 capitalize">{it.type || 'video'}</td>
                <td className="p-3">
                  <Badge status={it.status}>{it.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
