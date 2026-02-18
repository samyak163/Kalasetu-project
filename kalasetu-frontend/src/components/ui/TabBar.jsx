/**
 * Sticky horizontal tabs with underline indicator (Zomato/UC pattern).
 * Sticks to top when scrolled past. Content swaps below.
 *
 * @param {Array} tabs - [{ key, label, count? }]
 * @param {string} activeTab - Currently active tab key
 * @param {function} onTabChange - (key) => void
 */
export default function TabBar({ tabs = [], activeTab, onTabChange, className = '' }) {
  return (
    <div className={`sticky top-0 z-sticky bg-white border-b border-gray-200 ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === key
                ? 'text-brand-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            {count != null && (
              <span className="ml-1 text-xs text-gray-400">({count})</span>
            )}
            {/* Underline indicator */}
            {activeTab === key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
