import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
  outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-500 bg-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const iconOnlySizes = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconOnly = false,
  children,
  className = '',
  ...props
}) {
  const sizeClass = iconOnly ? iconOnlySizes[size] : sizes[size];
  return (
    <button
      className={`btn-press inline-flex items-center justify-center gap-2 font-medium rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
