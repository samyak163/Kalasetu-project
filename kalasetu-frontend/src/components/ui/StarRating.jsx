import { Star } from 'lucide-react';

const LABELS = { 1: 'Poor', 2: 'Below Average', 3: 'Average', 4: 'Good', 5: 'Excellent' };

const SIZE_MAP = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * Interactive star rating selector (or read-only display).
 *
 * @param {number} value — Current rating (0-5, 0 = unselected)
 * @param {(n: number) => void} onChange — Called with new rating
 * @param {'sm'|'md'|'lg'} size — Star icon size
 * @param {boolean} readOnly — If true, disables interaction
 * @param {boolean} showLabel — Show text label ("Poor" → "Excellent")
 */
export default function StarRating({ value = 0, onChange, size = 'lg', readOnly = false, showLabel = true, className = '' }) {
  const iconClass = SIZE_MAP[size] || SIZE_MAP.lg;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`p-1 transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            className={`${iconClass} transition-colors ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
      {showLabel && value > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-700">{LABELS[value]}</span>
      )}
    </div>
  );
}
