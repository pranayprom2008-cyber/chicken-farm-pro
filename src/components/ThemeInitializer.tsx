'use client';

import { useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function ThemeInitializer() {
  const { theme } = useFarmStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'obsidian', 'liquid-glass', 'liquid', 'spatial', 'spatial-glass', 'light');

      if (theme === 'light') {
        root.classList.add('light');
      } else if (theme === 'spatial' || theme === 'spatial-glass') {
        root.classList.add('spatial', 'spatial-glass', 'dark');
      } else if (theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass') {
        root.classList.add('liquid', 'liquid-glass', 'obsidian', 'dark');
      } else {
        root.classList.add('dark');
      }
    }
  }, [theme]);

  return null;
}
