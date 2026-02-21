import { AlertTriangle } from 'lucide-react';

export default function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-card rounded-card p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-error-50 rounded-full">
          <AlertTriangle className="w-6 h-6 text-error-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 font-display">
          Something went wrong
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          We've been notified and are working on a fix. Try refreshing the page or going back to the homepage.
        </p>
        {import.meta.env.DEV && error && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-700 font-mono overflow-auto max-h-32 text-left">
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
            onClick={() => (window.location.href = '/')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-button hover:bg-gray-300 btn-press"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
