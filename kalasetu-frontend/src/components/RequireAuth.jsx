import { useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
// Use absolute path
import { AuthContext } from "/src/context/AuthContext.jsx";

// --- UPGRADED RequireAuth ---
// It now accepts a 'role' prop ("artisan" or "user")
// It checks if the logged-in user's type matches the required role.

const RequireAuth = ({ children, role = 'user' }) => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  // 0. Wait for the auth state to be loaded
  if (loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  // 1. Check: Is anyone logged in?
  if (!auth.user) {
    // Redirect them to the correct login page based on the role we want
    const loginPath = role === 'artisan' ? '/artisan/login' : '/user/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Check: Is the logged-in user the correct TYPE?
  if (auth.userType !== role) {
    // User is logged in, but as the wrong type. Send them home.
    // (e.g., a USER trying to access /dashboard)
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default RequireAuth;

