import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const RedirectIfAuth = ({ children }) => {
  const { auth, loading } = useContext(AuthContext);
  if (loading) return null;
  if (auth.user) {
    const destination = auth.userType === 'artisan' ? '/artisan/dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }
  return children;
};

export default RedirectIfAuth;
