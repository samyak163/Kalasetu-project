import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/env.config.js';

export default function CallsHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_CONFIG.BASE_URL}/api/calls/history`, { withCredentials: true });
        setList(res.data?.data || []);
      } catch (_) {
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Call History</h1>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Started</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-3">{new Date(it.startedAt).toLocaleString()}</td>
                <td className="p-3">{Math.round((it.durationSec || 0) / 60)} min</td>
                <td className="p-3">{it.type}</td>
                <td className="p-3">{it.status}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-3" colSpan={4}>No calls yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


