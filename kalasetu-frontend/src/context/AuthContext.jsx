import React, { createContext, useState, useContext } from 'react';

// Create the context itself
const AuthContext = createContext(null);

// Create a provider component. This is the component that will "hold" the global state.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // By default, no one is logged in.

    // The login function that our LoginPage will call
    const login = (userData) => {
        // In a real app, you would also save the token to localStorage here
        setUser(userData);
    };

    // The logout function
    const logout = () => {
        // In a real app, you would also remove the token from localStorage
        setUser(null);
    };

    // The value that will be shared with all child components
    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to make it easy for other components to access the context
export const useAuth = () => {
    return useContext(AuthContext);
};
