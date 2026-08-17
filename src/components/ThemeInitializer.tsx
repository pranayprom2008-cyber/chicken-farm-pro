'use client';

import { useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function ThemeInitializer() {
  const { theme } = useFarmStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'spatial', 'spatial-glass', 'light', 'vibe', 'liquid', 'obsidian', 'liquid-glass');

      if (theme === 'light') {
        root.classList.add('light');
      } else if (theme === 'spatial' || theme === 'spatial-glass') {
        root.classList.add('spatial', 'spatial-glass', 'dark');
      } else if (theme === 'vibe') {
        root.classList.add('vibe', 'dark');
      } else {
        root.classList.add('dark');
      }
    }
  }, [theme]);

  return null;
}
