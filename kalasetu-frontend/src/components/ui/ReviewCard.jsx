import { ThumbsUp } from 'lucide-react';
import Badge from './Badge';
import Avatar from './Avatar';

/**
 * Individual review display (Zomato pattern).
 * Shows: user info, rating, tags, text, photos, artisan response, helpful vote.
 */
export default function ReviewCard({
  review,
  onHelpful,
  isHelpful = false,
  className = '',
}) {
  const { user, rating, comment, tags = [], images = [], response, helpfulVotes = [], createdAt } = review;
  const date = new Date(createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className={`py-4 border-b border-gray-100 last:border-0 ${className}`}>
      {/* Header: user + rating + date */}
      <div className="flex items-center gap-3">
        <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'Anonymous'}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <Badge variant="rating" rating={rating} />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Comment */}
      {comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{comment}</p>}

      {/* Photos */}
      {images.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <img key={`${img}-${i}`} src={img} alt={`Review photo ${i + 1}`} className="w-20 h-20 rounded-lg object-cover shrink-0" loading="lazy" />
          ))}
        </div>
      )}

      {/* Artisan response */}
      {response?.text && (
        <div className="mt-3 ml-4 pl-3 border-l-2 border-brand-200">
          <p className="text-xs font-medium text-brand-600">Artisan's Response</p>
          <p className="text-sm text-gray-600 mt-0.5">{response.text}</p>
        </div>
      )}

      {/* Helpful button */}
      <button
        onClick={onHelpful}
        className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
          isHelpful ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
        Helpful{helpfulVotes.length > 0 && ` (${helpfulVotes.length})`}
      </button>
    </div>
  );
}
