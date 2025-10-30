import { createContext, useEffect, useState, useCallback } from "react";
// FIX: Using relative path from context/ to lib/
import api from "../lib/axios.js";

export const AuthContext = createContext();

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
    } catch (userErr) {
      // 2. If no customer, try to get an ARTISAN user
      try {
        const artisanRes = await api.get("/api/auth/me");
        setAuth({ user: artisanRes.data, userType: 'artisan' });
      } catch (artisanErr) {
        // 3. If neither, we are logged out.
        setAuth(initialAuthState);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Run bootstrap on initial mount
  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  // --- Artisan Auth Functions ---
  const artisanLogin = async (inputs) => {
    try {
      const res = await api.post("/api/auth/login", inputs);
      setAuth({ user: res.data, userType: 'artisan' });
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed login
      throw error;
    }
  };

  const artisanRegister = async (inputs) => {
    try {
      const res = await api.post("/api/auth/register", inputs);
      setAuth({ user: res.data, userType: 'artisan' });
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed register
      throw error;
    }
  };

  // --- Customer Auth Functions (NEW) ---
  const userLogin = async (inputs) => {
    try {
      const res = await api.post("/api/users/login", inputs);
      setAuth({ user: res.data, userType: 'user' });
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed login
      throw error;
    }
  };

  const userRegister = async (inputs) => {
    try {
      const res = await api.post("/api/users/register", inputs);
      setAuth({ user: res.data, userType: 'user' });
      return res.data;
    } catch (error) {
      setAuth(initialAuthState); // Clear auth on failed register
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
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        auth, // The main auth object { user, userType }
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

