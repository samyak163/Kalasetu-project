export default function Skeleton({ className = '', variant = 'rect', width, height, lines = 1 }) {
  const style = { width, height };

  if (variant === 'circle') {
    return <div className={`skeleton rounded-full ${className}`} style={{ width: width || '2.5rem', height: height || '2.5rem' }} />;
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-4" style={{ width: i === lines - 1 && lines > 1 ? '75%' : '100%' }} />
        ))}
      </div>
    );
  }

  return <div className={`skeleton ${className}`} style={style} />;
}
