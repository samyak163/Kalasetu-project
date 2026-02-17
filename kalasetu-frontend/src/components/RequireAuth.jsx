import { useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// RequireAuth accepts an optional 'role' prop ("artisan" or "user")
// When role is null/undefined, any authenticated user type is allowed.

const RequireAuth = ({ children, role }) => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in → redirect to login
  if (!auth.user) {
    const loginPath = role === 'artisan' ? '/artisan/login' : '/user/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If a specific role is required, enforce it
  if (role && auth.userType !== role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
