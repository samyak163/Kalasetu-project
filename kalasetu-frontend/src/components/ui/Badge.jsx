import { Star } from 'lucide-react';

const statusStyles = {
  pending: 'bg-warning-50 text-warning-700 border-warning-500/20',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-500/20',
  completed: 'bg-success-50 text-success-700 border-success-500/20',
  cancelled: 'bg-error-50 text-error-700 border-error-500/20',
  rejected: 'bg-gray-100 text-gray-700 border-gray-300/50',
};

function getRatingColor(rating) {
  if (rating >= 4) return 'bg-success-500 text-white';
  if (rating >= 3) return 'bg-warning-500 text-white';
  return 'bg-error-500 text-white';
}

export default function Badge({ status, variant, rating, count, children, className = '' }) {
  // Rating variant — Zomato-style color-coded badge
  if (variant === 'rating' && rating != null) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${getRatingColor(rating)} ${className}`}>
        <Star className="h-3 w-3 fill-current" />
        {rating.toFixed(1)}
        {count != null && <span className="font-normal opacity-80">({count})</span>}
      </span>
    );
  }

  // Status variant — existing behavior
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300/50';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '')}
    </span>
  );
}
