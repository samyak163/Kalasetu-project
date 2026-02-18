/**
 * Persistent bottom bar visible on scroll (UC/Swiggy pattern).
 * Used for "Book Now — Rs.1,299" on artisan profiles.
 * Mobile only — hidden on md+ screens.
 */
export default function StickyBottomCTA({ children, className = '' }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-sticky bg-white border-t border-gray-200 shadow-dropdown px-4 py-3 md:hidden ${className}`}>
      {children}
    </div>
  );
}
