export default function Card({ children, className = '', hover = true, padding = true }) {
  return (
    <div className={`bg-white rounded-card shadow-card ${hover ? 'card-hover' : ''} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
