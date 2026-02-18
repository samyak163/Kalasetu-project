import { useState, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';

/**
 * Swiggy-style slide-to-confirm button.
 * 70% threshold to trigger. Chevron morphs to checkmark on complete.
 */
export default function SlideToConfirm({ label = 'Slide to confirm', onConfirm, disabled = false }) {
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const handleStart = () => {
    if (disabled || confirmed) return;
    dragging.current = true;
  };

  const handleMove = (clientX) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left - 24) / (rect.width - 48)));
    setProgress(pct);
  };

  const handleEnd = () => {
    dragging.current = false;
    if (progress >= 0.7) {
      setProgress(1);
      setConfirmed(true);
      onConfirm?.();
    } else {
      setProgress(0);
    }
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-full overflow-hidden select-none ${disabled ? 'opacity-50' : ''} ${confirmed ? 'bg-success-500' : 'bg-gray-100'}`}
      onMouseDown={handleStart}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Fill track */}
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${confirmed ? 'bg-success-500' : 'bg-brand-500/20'}`}
        style={{ width: `${progress * 100}%` }}
      />

      {/* Label */}
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-medium transition-opacity ${confirmed ? 'text-white' : 'text-gray-500'}`}>
        {confirmed ? 'Confirmed!' : label}
      </span>

      {/* Thumb */}
      <div
        className={`absolute top-1 bottom-1 w-12 rounded-full flex items-center justify-center shadow-card transition-colors ${confirmed ? 'bg-white' : 'bg-brand-500'}`}
        style={{ left: `${Math.max(0, progress * (100 - 15))}%` }}
      >
        {confirmed ? (
          <Check className="h-5 w-5 text-success-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-white" />
        )}
      </div>
    </div>
  );
}
