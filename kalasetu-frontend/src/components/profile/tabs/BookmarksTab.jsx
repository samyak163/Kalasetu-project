import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { Card, Avatar, Badge, Button, Input, EmptyState, Skeleton } from '../../ui';
import { Heart, Bookmark, Search } from 'lucide-react';

const BookmarksTab = ({ user }) => {
  const { showToast } = React.useContext(ToastContext);
  const navigate = useNavigate();
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
      const data = res?.data;
      // Filter out null entries (deleted artisans)
      setBookmarks(Array.isArray(data) ? data.filter(Boolean) : []);
    } catch (error) {
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
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" height="28px" width="200px" />
        <Skeleton variant="rect" height="42px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rect" height="240px" className="rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">
          Saved Artisans ({bookmarks.length})
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Artisan profiles you've bookmarked
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-input focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900 text-sm"
        >
          <option value="recent">Recently Added</option>
          <option value="rating">Rating (High to Low)</option>
          <option value="name">Name (A-Z)</option>
        </select>
        <select
          value={filterBy}
          onChange={e => setFilterBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-input focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-white dark:text-gray-900 text-sm"
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
            <Card key={artisan._id}>
              <div className="flex items-start justify-between mb-4">
                <Avatar
                  src={artisan.profileImageUrl}
                  name={artisan.fullName}
                  size="xl"
                />
                <button
                  onClick={() => handleRemoveBookmark(artisan._id)}
                  className="text-brand-500 hover:text-brand-600 transition-colors"
                  aria-label="Remove bookmark"
                >
                  <Heart className="h-5 w-5" fill="currentColor" />
                </button>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                {artisan.fullName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{artisan.craft}</p>
              <div className="mb-4">
                <Badge variant="rating" rating={artisan.rating || 0} count={artisan.reviewCount || 0} />
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/${artisan.publicId}`}
                  className="flex-1"
                >
                  <Button variant="primary" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/messages?artisan=${artisan._id}`)}
                >
                  Contact
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="h-12 w-12" />}
          title="No saved artisans yet"
          description="Bookmark artisans to easily find them later!"
          action={
            <Link to="/search">
              <Button variant="primary">Browse Artisans</Button>
            </Link>
          }
        />
      )}
    </div>
  );
};

export default BookmarksTab;
