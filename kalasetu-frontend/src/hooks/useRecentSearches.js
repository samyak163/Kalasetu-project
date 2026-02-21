import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ks_recent_searches';
const MAX_ITEMS = 10;

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

/**
 * Reactive hook for managing recent searches in localStorage.
 * Stores up to 10 unique search terms, newest first.
 */
export default function useRecentSearches() {
  const [searches, setSearches] = useState(readStorage);

  const addSearch = useCallback((term) => {
    const trimmed = typeof term === 'string' ? term.trim() : '';
    if (!trimmed) return;

    setSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSearch = useCallback((term) => {
    setSearches((prev) => {
      const next = prev.filter((s) => s !== term);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSearches([]);
  }, []);

  return { searches, addSearch, removeSearch, clearSearches };
}
