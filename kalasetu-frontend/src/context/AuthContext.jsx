import { createContext, useContext, useEffect, useState, useCallback } from "react";
// FIX: Using relative path from context/ to lib/
import api from "../lib/axios.js";
import { setSentryUser, clearSentryUser } from "../lib/sentry.js";
import { identifyLogRocketUser } from "../lib/logrocket.js";
import { addLogRocketTag } from "../lib/logrocket.js";
import { identifyPostHogUser, resetPostHog } from "../lib/posthog.js";
import { setOneSignalUserId, removeOneSignalUserId, addTags } from "../lib/onesignal.js";

export const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }
  return context;
};

// This is the new "empty" auth state
const initialAuthState = {
  user: null,
  userType: null, // 'artisan' or 'user'
};

export const AuthContextProvider = ({ children }) => {
  const [auth, setAuth] = useState(initialAuthState);
  const [loading, setLoading] = useState(true);

  // This function now checks for BOTH user types when the app loads
  const bootstrapAuth = useCallback(async () => {
    setLoading(true);
    try {
      // 1. First, try to get a CUSTOMER user
      const userRes = await api.get("/api/users/me");
      setAuth({ user: userRes.data, userType: 'user' });
      setSentryUser(userRes.data);
    } catch (userErr) {
      // 2. If no customer, try to get an ARTISAN user
      try {
        const artisanRes = await api.get("/api/auth/me");
        setAuth({ user: artisanRes.data, userType: 'artisan' });
        setSentryUser(artisanRes.data);
      } catch (artisanErr) {
        // 3. If neither, we are logged out.
        setAuth(initialAuthState);
        clearSentryUser();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Run bootstrap on initial mount
  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  // Identify user in LogRocket after successful login
  useEffect(() => {
    if (auth.user) {
      identifyLogRocketUser(auth.user);
      addLogRocketTag('user-type', auth.userType || 'customer');
      identifyPostHogUser(auth.user);
      
      // Set OneSignal user ID and tags
      setOneSignalUserId(auth.user.id || auth.user._id);
      addTags({
        accountType: auth.user.role || 'customer',
        email: auth.user.email,
        verified: auth.user.verified ? 'true' : 'false',
      });
    }
  }, [auth.user, auth.userType]);

  // --- Artisan Auth Functions ---
  const artisanLogin = async (inputs) => {
    try {
      const res = await api.post("/api/auth/login", inputs);
      setAuth({ user: res.data, userType: 'artisan' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed login
      clearSentryUser();
      throw error;
    }
  };

  const artisanRegister = async (inputs) => {
    try {
      const res = await api.post("/api/auth/register", inputs);
      setAuth({ user: res.data, userType: 'artisan' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed register
      clearSentryUser();
      throw error;
    }
  };

  // --- Customer Auth Functions (NEW) ---
  const userLogin = async (inputs) => {
    try {
      const res = await api.post("/api/users/login", inputs);
      setAuth({ user: res.data, userType: 'user' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed login
      clearSentryUser();
      throw error;
    }
  };

  const userRegister = async (inputs) => {
    try {
      const res = await api.post("/api/users/register", inputs);
      setAuth({ user: res.data, userType: 'user' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed register
      clearSentryUser();
      throw error;
    }
  };

  // --- Universal Logout Function ---
  const logout = async () => {
    try {
      // Call the correct logout endpoint based on user type
      if (auth.userType === 'artisan') {
        await api.post("/api/auth/logout");
      } else if (auth.userType === 'user') {
        await api.post("/api/users/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuth(initialAuthState); // Reset auth state regardless of error
      clearSentryUser();
      resetPostHog();
      await removeOneSignalUserId();
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        auth, // The main auth object { user, userType }
        user: auth.user, // Convenience accessor
        userType: auth.userType, // Convenience accessor
        isAuthenticated: !!auth.user, // Convenience boolean
        artisanLogin,
        artisanRegister,
        userLogin,
        userRegister,
        logout, 
        loading 
      }}
    >
      {/* Render children only when auth check is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

