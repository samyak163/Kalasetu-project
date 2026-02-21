import { Clock, CheckCircle, XCircle, Ban } from 'lucide-react';

const config = {
  pending: { icon: Clock, bg: 'bg-warning-50', text: 'text-warning-700', label: 'Pending' },
  confirmed: { icon: CheckCircle, bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
  completed: { icon: CheckCircle, bg: 'bg-success-50', text: 'text-success-700', label: 'Completed' },
  cancelled: { icon: Ban, bg: 'bg-error-50', text: 'text-error-700', label: 'Cancelled' },
  rejected: { icon: XCircle, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Rejected' },
};

export default function StatusBadge({ status, className = '' }) {
  const { icon: Icon, bg, text, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
