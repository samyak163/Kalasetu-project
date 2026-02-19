import { Clock, IndianRupee } from 'lucide-react';
import { Card, Button, EmptyState } from '../ui/index.js';
import { optimizeImage } from '../../utils/cloudinary.js';

/**
 * Services tab content for the artisan profile page.
 * UC-inspired service cards with image, name, description, price, duration, and Book CTA.
 *
 * When the offering redesign adds ServiceCard to the design system,
 * this component should adopt it. For now, uses Card + custom layout.
 */
export default function ServicesTab({ services = [], onBook, className = '' }) {
  if (services.length === 0) {
    return (
      <EmptyState
        title="No services listed yet"
        description="This artisan hasn't added any services. Check back later or send them a message."
        className={className}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {services.map((service) => (
        <ServiceItem key={service._id} service={service} onBook={onBook} />
      ))}
    </div>
  );
}

function ServiceItem({ service, onBook }) {
  const hasImage = service.images?.length > 0;

  return (
    <Card interactive compact className="flex flex-col overflow-hidden">
      {/* Service image */}
      {hasImage && (
        <img
          src={optimizeImage(service.images[0], { width: 400, height: 220, crop: 'fill' })}
          alt={service.name}
          className="w-full h-44 object-cover -mx-3 -mt-3 mb-3"
          style={{ width: 'calc(100% + 1.5rem)' }}
          loading="lazy"
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{service.name}</h3>
        {service.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
        )}

        {/* Price + Duration */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="inline-flex items-center gap-1 font-bold text-gray-900">
            <IndianRupee className="h-3.5 w-3.5" />
            {service.price > 0 ? service.price.toLocaleString('en-IN') : 'Contact'}
          </span>
          {service.durationMinutes > 0 && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(service.durationMinutes)}
            </span>
          )}
        </div>

        {/* Book CTA */}
        <Button
          variant="primary"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onBook(service)}
        >
          Book This Service
        </Button>
      </div>
    </Card>
  );
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
