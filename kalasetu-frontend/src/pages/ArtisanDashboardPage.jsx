import { Navigate } from 'react-router-dom';

// Legacy page - redirects to the unified ArtisanAccountPage at /artisan/dashboard
export default function ArtisanDashboardPage() {
  return <Navigate to="/artisan/dashboard" replace />;
}