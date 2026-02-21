import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Briefcase, Users, Star, DollarSign, MessageSquare, Settings, X, Clock } from 'lucide-react';

const AdminGlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Navigation items with icons and keywords
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', keywords: ['dashboard', 'home', 'overview', 'stats', 'analytics'] },
    { name: 'Artisans', icon: Briefcase, path: '/admin/artisans', keywords: ['artisans', 'artisan', 'craftsmen', 'providers', 'sellers'] },
    { name: 'Users', icon: Users, path: '/admin/users', keywords: ['users', 'user', 'customers', 'clients', 'members'] },
    { name: 'Reviews', icon: Star, path: '/admin/reviews', keywords: ['reviews', 'review', 'ratings', 'feedback', 'comments'] },
    { name: 'Payments', icon: DollarSign, path: '/admin/payments', keywords: ['payments', 'payment', 'transactions', 'revenue', 'money', 'refund'] },
    { name: 'Bookings', icon: MessageSquare, path: '/admin/bookings', keywords: ['bookings', 'booking', 'appointments', 'schedules', 'reservations'] },
    { name: 'Settings', icon: Settings, path: '/admin/settings', keywords: ['settings', 'setting', 'configuration', 'config', 'preferences', 'options'] }
  ];

  // Quick actions
  const quickActions = [
    { name: 'View All Artisans', path: '/admin/artisans', keywords: ['all artisans', 'list artisans'] },
    { name: 'View All Users', path: '/admin/users', keywords: ['all users', 'list users'] },
    { name: 'Flagged Reviews', path: '/admin/reviews?status=flagged', keywords: ['flagged', 'reported reviews'] },
    { name: 'Pending Payments', path: '/admin/payments?status=pending', keywords: ['pending payments', 'unpaid'] },
    { name: 'Upcoming Bookings', path: '/admin/bookings?status=confirmed', keywords: ['upcoming', 'confirmed bookings'] }
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adminRecentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('adminRecentSearches', JSON.stringify(updated));
  };

  // Generate suggestions based on query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const matched = [];

    // Match navigation items
    navigationItems.forEach(item => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some(kw => kw.includes(query));
      if (nameMatch || keywordMatch) {
        matched.push({
          type: 'navigation',
          name: item.name,
          icon: item.icon,
          path: item.path,
          matchType: nameMatch ? 'name' : 'keyword'
        });
      }
    });

    // Match quick actions
    quickActions.forEach(action => {
      const nameMatch = action.name.toLowerCase().includes(query);
      const keywordMatch = action.keywords.some(kw => kw.includes(query));
      if (nameMatch || keywordMatch) {
        matched.push({
          type: 'action',
          name: action.name,
          path: action.path,
          matchType: nameMatch ? 'name' : 'keyword'
        });
      }
    });

    // Match recent searches
    recentSearches.forEach(recent => {
      if (recent.toLowerCase().includes(query) && !matched.some(m => m.name === recent)) {
        matched.push({
          type: 'recent',
          name: recent,
          path: null
        });
      }
    });

    setSuggestions(matched.slice(0, 8));
    setShowSuggestions(matched.length > 0);
  }, [searchQuery, recentSearches]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.path) {
      saveRecentSearch(searchQuery);
      navigate(suggestion.path);
      setSearchQuery('');
      setShowSuggestions(false);
    } else if (suggestion.type === 'recent') {
      setSearchQuery(suggestion.name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1 max-w-2xl" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 || recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search pages & navigate (use page search bars to filter data)..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm md:text-base"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    {!Icon && suggestion.type === 'recent' && (
                      <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</div>
                      {suggestion.path && (
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.path.replace('/admin/', '')}
                        </div>
                      )}
                    </div>
                    {suggestion.type === 'navigation' && (
                      <span className="text-xs text-brand-500 bg-brand-50 px-2 py-1 rounded flex-shrink-0">
                        Page
                      </span>
                    )}
                    {suggestion.type === 'action' && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex-shrink-0">
                        Action
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            searchQuery.trim() === '' && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Recent Searches</div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(recent)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{recent}</span>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSearch;

