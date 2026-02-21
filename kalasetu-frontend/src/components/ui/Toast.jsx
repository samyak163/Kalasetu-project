import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-success-50 border-success-500/30 text-success-700',
  error: 'bg-error-50 border-error-500/30 text-error-700',
  info: 'bg-blue-50 border-blue-500/30 text-blue-700',
};

export default function Toast({ toast, onDismiss }) {
  const { id, type = 'info', message, duration = 4000 } = toast;
  const Icon = icons[type] || icons.info;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      role="status"
      className={`w-full border rounded-card shadow-dropdown p-3 flex items-start gap-2 animate-slide-in ${styles[type] || styles.info}`}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="p-0.5 hover:opacity-70" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
