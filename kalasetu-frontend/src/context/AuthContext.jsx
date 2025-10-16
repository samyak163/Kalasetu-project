import { createContext, useEffect, useState } from "react";
import api from "../lib/axios.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap user session on mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setCurrentUser(res.data);
      } catch (error) {
        // User not authenticated, clear any stale data
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (inputs) => {
    try {
      const res = await api.post("/api/auth/login", inputs);
      setCurrentUser(res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (inputs) => {
    try {
      const res = await api.post("/api/auth/register", inputs);
      setCurrentUser(res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
