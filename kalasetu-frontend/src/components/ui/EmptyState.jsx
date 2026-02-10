export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>}
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
