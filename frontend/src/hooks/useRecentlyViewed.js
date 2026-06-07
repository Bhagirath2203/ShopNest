import { useState, useCallback } from 'react';

const KEY = 'shopnest_recently_viewed';
const MAX = 5;

/**
 * useRecentlyViewed — manages last N viewed product IDs in localStorage
 * Returns [ids, addId]
 */
export default function useRecentlyViewed() {
  const [ids, setIds] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addId = useCallback((id) => {
    if (!id) return;
    setIds((prev) => {
      const numId = Number(id);
      // Remove if already present (dedup), push to front, cap at MAX
      const updated = [numId, ...prev.filter((x) => x !== numId)].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(updated));
      } catch { /* storage full */ }
      return updated;
    });
  }, []);

  return [ids, addId];
}
