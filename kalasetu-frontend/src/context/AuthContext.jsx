import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    // The API endpoint is now relative, which works for both localhost and Vercel.
    const res = await axios.post("/api/artisans/login", inputs);
    setCurrentUser(res.data);
    return res.data; // Return the user data so the calling component can use it.
  };

  const logout = async () => {
    // Use a relative path for logout as well.
    await axios.post("/api/artisans/logout");
    setCurrentUser(null);
  };

  useEffect(() => {
    // This effect runs whenever the currentUser state changes.
    // It keeps localStorage in sync with the user's authentication state.
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
