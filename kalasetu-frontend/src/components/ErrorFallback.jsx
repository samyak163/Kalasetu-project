export default function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-card rounded-card p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-error-50 rounded-full">
          <svg className="w-6 h-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 font-display">
          Something went wrong
        </h3>
        <p className="mt-2 text-sm text-center text-gray-600">
          We've been notified and are working on a fix.
        </p>
        {error && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-700 font-mono overflow-auto max-h-32">
            {error.toString()}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-button hover:bg-brand-600 btn-press"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-button hover:bg-gray-300 btn-press"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
