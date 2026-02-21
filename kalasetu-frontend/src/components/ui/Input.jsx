export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  as = 'input',
  options = [],
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const baseClass = `w-full px-3 py-2 rounded-input border ${
    error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 focus:ring-brand-500'
  } focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-sm`;

  let element;
  if (as === 'textarea') {
    element = (
      <textarea
        id={inputId}
        className={`${baseClass} resize-y min-h-[80px]`}
        aria-invalid={!!error}
        aria-describedby={inputId ? (error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined) : undefined}
        {...props}
      />
    );
  } else if (as === 'select') {
    element = (
      <select
        id={inputId}
        className={`${baseClass} appearance-none bg-white`}
        aria-invalid={!!error}
        aria-describedby={inputId ? (error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined) : undefined}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  } else {
    element = (
      <input
        id={inputId}
        className={baseClass}
        aria-invalid={!!error}
        aria-describedby={inputId ? (error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined) : undefined}
        {...props}
      />
    );
  }

  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {element}
      {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">{error}</p>}
      {!error && helperText && <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
