import { useState, useEffect } from 'react';

const STORAGE_KEY = 'scholarhub-theme';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // Apply saved preference on mount (prevents mismatch after FOUC script)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(saved);
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const nowDark = document.documentElement.classList.contains('dark');
    const next = nowDark ? 'light' : 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { isDark, toggle };
}
