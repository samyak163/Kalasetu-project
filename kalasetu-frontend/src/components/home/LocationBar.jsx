import { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const CITIES = [
  'All Cities',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Ahmedabad',
  'Lucknow',
];

/**
 * Sticky city selector bar (UC/Swiggy pattern).
 * Persists selection in localStorage and dispatches a custom event
 * so other components (e.g. artisan carousels) can react.
 */
export default function LocationBar({ onCityChange }) {
  const [city, setCity] = useState(() => localStorage.getItem('ks_city') || 'All Cities');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Sync from other tabs / components
    const handler = (e) => setCity(e.detail);
    window.addEventListener('ks:city-change', handler);
    return () => window.removeEventListener('ks:city-change', handler);
  }, []);

  const select = (c) => {
    setCity(c);
    setOpen(false);
    localStorage.setItem('ks_city', c);
    window.dispatchEvent(new CustomEvent('ks:city-change', { detail: c }));
    onCityChange?.(c);
  };

  return (
    <div className="sticky top-0 z-sticky bg-white border-b border-gray-100 px-4 py-2">
      <div className="max-w-container mx-auto flex items-center justify-between">
        {/* Brand */}
        <span className="text-lg font-display font-bold text-brand-500">KalaSetu</span>

        {/* City selector */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-brand-500 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{city}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              {/* Dropdown */}
              <div role="listbox" aria-label="Select city" className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-card shadow-dropdown border border-gray-100 py-1 max-h-64 overflow-y-auto">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    role="option"
                    aria-selected={c === city}
                    onClick={() => select(c)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      c === city
                        ? 'bg-brand-50 text-brand-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
