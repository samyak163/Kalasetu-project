import { Clock, IndianRupee } from 'lucide-react';
import { BottomSheet } from '../ui/index.js';

/**
 * Service selection sheet — shown when "Book Now" is tapped
 * and the artisan has 2+ services. Lists all services with
 * name, description, duration, and price. Tapping a row
 * proceeds to ServiceSummarySheet.
 */
export default function ServicePickerSheet({ services = [], open, onClose, onSelect }) {
  if (!services.length) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Choose a Service">
      <div className="space-y-2">
        {services.map((service) => (
          <button
            key={service._id}
            type="button"
            onClick={() => onSelect(service)}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-muted hover:bg-gray-100 transition-colors text-left"
          >
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{service.name}</h4>
              {service.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 text-sm">
              {service.durationMinutes > 0 && (
                <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatDuration(service.durationMinutes)}
                </span>
              )}
              <span className="font-bold text-gray-900 inline-flex items-center gap-0.5">
                <IndianRupee className="h-3 w-3" />
                {service.price > 0 ? service.price.toLocaleString('en-IN') : 'Contact'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
