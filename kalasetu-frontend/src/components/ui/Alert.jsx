import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const variantConfig = {
  success: { bg: 'bg-success-50 border-success-500/20 text-success-700', icon: CheckCircle },
  error: { bg: 'bg-error-50 border-error-500/20 text-error-700', icon: XCircle },
  warning: { bg: 'bg-warning-50 border-warning-500/20 text-warning-700', icon: AlertTriangle },
  info: { bg: 'bg-blue-50 border-blue-500/20 text-blue-700', icon: Info },
};

export default function Alert({ variant = 'info', children, className = '', onDismiss }) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-card border ${config.bg} ${className}`} role="alert">
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 p-0.5 rounded hover:bg-black/5" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
