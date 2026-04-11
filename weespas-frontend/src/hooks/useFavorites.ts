/* ==========================================================================
   useFavorites Hook
   localStorage-backed favorites with React state sync.
   Persists across sessions, syncs across components via state.
   ========================================================================== */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'weespas_favorites';

/** Read favorites from localStorage */
function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Write favorites to localStorage */
function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* Storage full or unavailable — degrade silently */
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const favoriteCount = favorites.length;

  return { favorites, isFavorite, toggleFavorite, favoriteCount };
}
