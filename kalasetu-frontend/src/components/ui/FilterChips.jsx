/**
 * Horizontal scrollable filter pills (Zomato/Swiggy pattern).
 * Active chips get brand-color fill. Inactive chips are outlined.
 *
 * @param {Array} chips - [{ key, label, active, onClick }]
 */
export default function FilterChips({ chips = [], className = '' }) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {chips.map(({ key, label, active, onClick }) => (
        <button
          key={key}
          onClick={onClick}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${
            active
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
