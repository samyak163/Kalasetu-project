import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const RedirectIfAdminAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/admin/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default RedirectIfAdminAuth;
