import { useState, useEffect } from 'react';

type UseLocalFiltersReturn<T> = readonly [T, (updater: T | ((prev: T) => T)) => void];

export function useLocalFilters<T extends Record<string, any>>(
  key: string,
  defaults: T
): UseLocalFiltersReturn<T> {
  const [filters, setFiltersState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaults;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : defaults;
    } catch {
      return defaults;
    }
  });


  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(filters));
    } catch {
      console.warn(`Failed to save filters to localStorage for key: ${key}`);
    }
  }, [key, filters]);

 
  const setFilters = (updater: T | ((prev: T) => T)) => {
    setFiltersState(prev => {
      const next = typeof updater === 'function'
        ? (updater as (prev: T) => T)(prev)
        : updater;
      return next;
    });
  };

  return [filters, setFilters] as const;
}