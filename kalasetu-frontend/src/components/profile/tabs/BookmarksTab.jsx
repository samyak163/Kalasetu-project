import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '/src/lib/axios.js';
import { ToastContext } from '/src/context/ToastContext.jsx';

const BookmarksTab = ({ user }) => {
  const { showToast } = React.useContext(ToastContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/api/users/bookmarks');
      setBookmarks(res.data || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      showToast('Failed to load bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (artisanId) => {
    if (!window.confirm('Remove this artisan from your bookmarks?')) return;

    try {
      await api.delete(`/api/users/bookmarks/${artisanId}`);
      setBookmarks(prev => prev.filter(a => a._id !== artisanId));
      showToast('Bookmark removed successfully', 'success');
    } catch (error) {
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const filteredAndSorted = bookmarks
    .filter(artisan => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          artisan.fullName?.toLowerCase().includes(query) ||
          artisan.craft?.toLowerCase().includes(query)
        );
      }
      if (filterBy !== 'all') {
        return artisan.craft === filterBy;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const crafts = [...new Set(bookmarks.map(b => b.craft).filter(Boolean))];

  if (loading) {
    return <div className="text-center py-8">Loading bookmarks...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Artisans ({bookmarks.length})
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Artisan profiles you've bookmarked
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white"
        >
          <option value="recent">Recently Added</option>
          <option value="rating">Rating (High to Low)</option>
          <option value="name">Name (A-Z)</option>
        </select>
        <select
          value={filterBy}
          onChange={e => setFilterBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Specialties</option>
          {crafts.map(craft => (
            <option key={craft} value={craft}>{craft}</option>
          ))}
        </select>
      </div>

      {/* Bookmarks Grid */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map(artisan => (
            <div
              key={artisan._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <img
                  src={artisan.profileImageUrl || 'https://placehold.co/100x100'}
                  alt={artisan.fullName}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <button
                  onClick={() => handleRemoveBookmark(artisan._id)}
                  className="text-[#A55233] hover:text-[#8e462b] transition-colors"
                  aria-label="Remove bookmark"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                {artisan.fullName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{artisan.craft}</p>
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {artisan.rating?.toFixed(1) || '—'} ({artisan.reviewCount || 0})
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/${artisan.publicId}`}
                  className="flex-1 text-center px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors text-sm"
                >
                  View Profile
                </Link>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No saved artisans yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Bookmark artisans to easily find them later!
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
          >
            Browse Artisans
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookmarksTab;
