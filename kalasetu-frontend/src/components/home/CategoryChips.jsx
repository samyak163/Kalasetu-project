import { useNavigate } from 'react-router-dom';
import { Palette, Scissors, UtensilsCrossed, Shirt, Sparkles } from 'lucide-react';
import useCategories from '../../hooks/useCategories.js';

const CATEGORY_ICONS = {
  Handicrafts: Palette,
  'Home Services': Scissors,
  'Food & Catering': UtensilsCrossed,
  'Clothing & Tailoring': Shirt,
  'Wellness & Beauty': Sparkles,
};

/**
 * Horizontal scrollable category chips (replaces old grid).
 * Fetches from /api/categories, falls back to defaults.
 */
export default function CategoryChips({ className = '' }) {
  const navigate = useNavigate();
  const { categories, loading } = useCategories();

  const chips = (categories.length > 0 ? categories : [
    { name: 'Handicrafts' },
    { name: 'Home Services' },
    { name: 'Food & Catering' },
    { name: 'Clothing & Tailoring' },
    { name: 'Wellness & Beauty' },
  ]).slice(0, 8);

  if (loading && categories.length === 0) {
    return (
      <div className={`flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-gray-200 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide ${className}`}>
      {chips.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.name];
        return (
          <button
            key={cat.name}
            onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
            className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors shrink-0"
          >
            {Icon && <Icon className="h-4 w-4" />}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
