import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

const CATEGORIES = ['Mehendi', 'Pottery', 'Weaving', 'Jewelry', 'Painting', 'Woodwork'];

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* CSS Illustration */}
        <div className="relative mx-auto w-40 h-40">
          <div className="absolute inset-0 rounded-full bg-brand-50" />
          <div className="absolute top-6 left-8 w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-5xl font-bold text-brand-300">404</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-brand-200" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
          <p className="mt-2 text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try searching instead..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">Search</Button>
        </form>

        {/* Category Links */}
        <div>
          <p className="text-sm text-gray-500 mb-3">Popular categories</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/search?q=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-full hover:bg-brand-100 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
