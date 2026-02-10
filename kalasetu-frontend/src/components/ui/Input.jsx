export default function Input({ label, error, helperText, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-3 py-2 rounded-input border ${error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 focus:ring-brand-500'} focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-sm`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">{error}</p>}
      {!error && helperText && <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
