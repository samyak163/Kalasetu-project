import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'medium';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
    
    // Apply font size
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = sizes[fontSize] || sizes.medium;
    localStorage.setItem('fontSize', fontSize);
  }, [theme, fontSize]);

  useEffect(() => {
    // Sync with system preference if theme is 'auto'
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handler);
      handler(mediaQuery);
      
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const updateTheme = useCallback(async (newTheme) => {
    setTheme(newTheme);
    try {
      // Update in backend if user is logged in
      await api.put('/api/users/profile', {
        preferences: { theme: newTheme },
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const updateFontSize = useCallback(async (newSize) => {
    setFontSize(newSize);
    try {
      await api.put('/api/users/profile', {
        preferences: { fontSize: newSize },
      });
    } catch (error) {
      console.error('Failed to save font size preference:', error);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, fontSize, updateTheme, updateFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
