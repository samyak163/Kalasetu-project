export default function Card({
  children,
  className = '',
  hover = true,
  padding = true,
  interactive = false,
  compact = false,
  onClick,
}) {
  const padClass = compact ? 'p-3' : padding ? 'p-6' : '';
  const hoverClass = interactive
    ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200'
    : hover ? 'card-hover' : '';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      className={`bg-white rounded-card shadow-card ${hoverClass} ${padClass} ${className}`}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}
