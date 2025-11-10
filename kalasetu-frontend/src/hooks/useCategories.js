import { useEffect, useState, useMemo } from 'react';
import api from '../lib/axios.js';

const initialState = {
  categories: [],
  extraServices: [],
  loading: true,
  error: null,
};

const useCategories = () => {
  const [{ categories, extraServices, loading, error }, setState] = useState(initialState);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/suggestions/services/all');
        if (!isMounted) return;
        setState({
          categories: response.data?.categories || [],
          extraServices: response.data?.extraServices || [],
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load categories', err);
        setState((prev) => ({ ...prev, loading: false, error: err }));
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({ categories, extraServices, loading, error }), [categories, extraServices, loading, error]);
  return value;
};

export default useCategories;
