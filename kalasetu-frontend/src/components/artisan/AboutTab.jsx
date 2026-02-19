import { useState, useEffect } from 'react';
import { MapPin, Clock, Award, Languages, Briefcase, Users, Globe } from 'lucide-react';
import api from '../../lib/axios.js';
import { Card, ImageCarousel, Skeleton, EmptyState } from '../ui/index.js';
import { optimizeImage } from '../../utils/cloudinary.js';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

/**
 * About tab for artisan profile page.
 * Bio, portfolio gallery (from Project model), working hours,
 * certifications, languages, and location info.
 */
export default function AboutTab({ artisan, className = '' }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch portfolio projects (richer than portfolioImageUrls)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/api/artisans/${artisan.publicId}/portfolio`);
        if (!cancelled) setProjects(res.data?.data || []);
      } catch {
        // Fall back to flat image array
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoadingProjects(false);
      }
    })();
    return () => { cancelled = true; };
  }, [artisan.publicId]);

  const hasWorkingHours = artisan.workingHours && DAY_ORDER.some(d => artisan.workingHours[d]?.active);
  const hasCertifications = artisan.certifications?.length > 0;
  const hasLanguages = artisan.languagesSpoken?.length > 0;
  const hasLocation = artisan.location?.city || artisan.location?.address;

  // Build gallery images: prefer portfolio projects, fall back to portfolioImageUrls
  const galleryImages = projects.length > 0
    ? projects.flatMap(p => (p.images || []).map(url => optimizeImage(url, { width: 600, height: 400, crop: 'fill' })))
    : (artisan.portfolioImageUrls || []).map(url => optimizeImage(url, { width: 600, height: 400, crop: 'fill' }));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bio */}
      {artisan.bio && (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{artisan.bio}</p>

          {/* Quick info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {artisan.yearsOfExperience && (
              <InfoChip icon={Briefcase} label="Experience" value={artisan.yearsOfExperience} />
            )}
            {artisan.teamSize && (
              <InfoChip icon={Users} label="Team" value={artisan.teamSize} />
            )}
            {hasLanguages && (
              <InfoChip icon={Languages} label="Languages" value={artisan.languagesSpoken.join(', ')} />
            )}
            {artisan.serviceRadius > 0 && (
              <InfoChip icon={Globe} label="Service Area" value={`${artisan.serviceRadius} km radius`} />
            )}
          </div>
        </Card>
      )}

      {/* Portfolio gallery */}
      {loadingProjects ? (
        <Skeleton variant="rect" height="200px" className="rounded-card" />
      ) : galleryImages.length > 0 ? (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Portfolio</h3>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.filter(p => p.isPublic !== false).map(project => (
                <div key={project._id}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{project.title}</h4>
                  {project.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{project.description}</p>
                  )}
                  <ImageCarousel
                    images={(project.images || []).map(url => optimizeImage(url, { width: 600, height: 400, crop: 'fill' }))}
                    aspectRatio="3/2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <ImageCarousel images={galleryImages} aspectRatio="3/2" />
          )}
        </Card>
      ) : null}

      {/* Working hours */}
      {hasWorkingHours && (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            Working Hours
          </h3>
          <div className="space-y-1.5">
            {DAY_ORDER.map(day => {
              const hours = artisan.workingHours[day];
              if (!hours) return null;
              return (
                <div key={day} className="flex items-center text-sm">
                  <span className="w-10 font-medium text-gray-700">{DAY_LABELS[day]}</span>
                  {hours.active && hours.start && hours.end ? (
                    <span className="text-gray-600">{hours.start} - {hours.end}</span>
                  ) : (
                    <span className="text-gray-400">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {hasCertifications && (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-400" />
            Certifications
          </h3>
          <div className="space-y-2">
            {artisan.certifications.map((cert) => (
              <div key={`${cert.name}-${cert.issuingAuthority || ''}`} className="flex items-start gap-2 text-sm">
                <Award className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{cert.name}</p>
                  {cert.issuingAuthority && (
                    <p className="text-xs text-gray-500">{cert.issuingAuthority}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Location */}
      {hasLocation && (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            Location
          </h3>
          <p className="text-sm text-gray-700">
            {artisan.location.address || `${artisan.location.city}, ${artisan.location.state}`}
          </p>
          {artisan.location.postalCode && (
            <p className="text-xs text-gray-500 mt-0.5">PIN: {artisan.location.postalCode}</p>
          )}
        </Card>
      )}
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
      <Icon className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
