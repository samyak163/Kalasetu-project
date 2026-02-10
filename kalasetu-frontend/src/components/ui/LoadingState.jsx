export default function LoadingState({ message, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
      {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
