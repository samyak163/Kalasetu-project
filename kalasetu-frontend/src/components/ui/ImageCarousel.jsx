import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Swipeable image gallery for portfolios and product details.
 * Touch-friendly with snap scroll and pagination dots.
 */
export default function ImageCarousel({ images = [], aspectRatio = '16/9', className = '' }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);

  if (images.length === 0) return null;

  const scrollTo = (idx) => {
    setCurrent(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const idx = Math.round(scrollLeft / clientWidth);
    setCurrent(idx);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Images */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ aspectRatio }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Image ${i + 1}`}
            className="w-full shrink-0 snap-start object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Arrow buttons (desktop only) */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => scrollTo(Math.max(0, current - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={current === 0}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollTo(Math.min(images.length - 1, current + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={current === images.length - 1}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/60'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
