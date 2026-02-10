const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-lg',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Avatar({ src, name, size = 'md', className = '' }) {
  if (src) {
    return <img src={src} alt={name || 'Avatar'} className={`${sizeClasses[size]} rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium ${className}`}>
      {getInitials(name)}
    </div>
  );
}
