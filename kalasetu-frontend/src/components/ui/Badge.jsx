const statusStyles = {
  pending: 'bg-warning-50 text-warning-700 border-warning-500/20',
  confirmed: 'bg-success-50 text-success-700 border-success-500/20',
  completed: 'bg-gray-100 text-gray-700 border-gray-300/50',
  cancelled: 'bg-error-50 text-error-700 border-error-500/20',
  rejected: 'bg-error-50 text-error-700 border-error-500/20',
};

export default function Badge({ status, children, className = '' }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300/50';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {children || status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
