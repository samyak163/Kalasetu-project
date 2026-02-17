import { createContext, useContext, useEffect, useState, useCallback } from "react";
// FIX: Using relative path from context/ to lib/
import api, { setCsrfToken } from "../lib/axios.js";
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
      // 1. First, try to get a USER user
      const userRes = await api.get("/api/users/me");
      if (userRes.data.csrfToken) setCsrfToken(userRes.data.csrfToken);
      setAuth({ user: userRes.data, userType: 'user' });
      setSentryUser(userRes.data);
    } catch (userErr) {
      // 2. If no USER, try to get an ARTISAN user
      try {
        const artisanRes = await api.get("/api/auth/me");
        if (artisanRes.data.csrfToken) setCsrfToken(artisanRes.data.csrfToken);
        setAuth({ user: artisanRes.data, userType: 'artisan' });
        setSentryUser(artisanRes.data);
      } catch (artisanErr) {
        // 3. If neither, we are logged out.
        setAuth(initialAuthState);
        setCsrfToken(null);
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
      addLogRocketTag('user-type', auth.userType || 'USER');
      identifyPostHogUser(auth.user);

      // Set OneSignal user ID and tags
      setOneSignalUserId(auth.user.id || auth.user._id);
      addTags({
        accountType: auth.user.role || 'USER',
        email: auth.user.email,
        verified: auth.user.verified ? 'true' : 'false',
      });
    }
  }, [auth.user, auth.userType]);

  // --- Artisan Auth Functions ---
  const artisanLogin = async (inputs) => {
    try {
      const res = await api.post("/api/auth/login", inputs);
      if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
      setAuth({ user: res.data, userType: 'artisan' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState);
      setCsrfToken(null);
      clearSentryUser();
      throw error;
    }
  };

  const artisanRegister = async (inputs) => {
    try {
      const res = await api.post("/api/auth/register", inputs);
      if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
      const artisanData = res.data?.artisan || res.data;
      setAuth({ user: artisanData, userType: 'artisan' });
      setSentryUser(artisanData);
      return artisanData;
    } catch (error) {
      setAuth(initialAuthState);
      setCsrfToken(null);
      clearSentryUser();
      throw error;
    }
  };

  // --- USER Auth Functions (NEW) ---
  const userLogin = async (inputs) => {
    try {
      const res = await api.post("/api/users/login", inputs);
      if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
      setAuth({ user: res.data, userType: 'user' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState);
      setCsrfToken(null);
      clearSentryUser();
      throw error;
    }
  };

  const userRegister = async (inputs) => {
    try {
      const res = await api.post("/api/users/register", inputs);
      if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
      setAuth({ user: res.data, userType: 'user' });
      setSentryUser(res.data);
      return res.data;
    } catch (error) {
      setAuth(initialAuthState);
      setCsrfToken(null);
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
      setAuth(initialAuthState);
      setCsrfToken(null);
      clearSentryUser();
      resetPostHog();
      await removeOneSignalUserId();
      // Redirect to login page after logout
      window.location.href = '/user/login';
    }
  };

  // --- Simple login function (for compatibility with guide) ---
  const login = (userData, type) => {
    setAuth({ user: userData, userType: type });
    setSentryUser(userData);

    // Initialize PostHog
    if (window.posthog) {
      window.posthog.identify(userData._id || userData.id, {
        email: userData.email,
        name: userData.fullName || userData.name,
        user_type: type
      });
    }

    // Initialize LogRocket
    if (window.LogRocket) {
      window.LogRocket.identify(userData._id || userData.id, {
        name: userData.fullName || userData.name,
        email: userData.email,
        user_type: type
      });
    }
  };

  // --- Check auth function (for compatibility) ---
  const checkAuth = async () => {
    await bootstrapAuth();
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
        login, // Simple login function
        logout,
        checkAuth, // Check auth function
        bootstrapAuth, // Re-fetch auth state without full reload
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

