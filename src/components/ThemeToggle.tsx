'use client';

import React from 'react';
import { Sun, Moon, Sparkles, Glasses } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';

export default function ThemeToggle() {
  const { theme, setTheme, sidebarOpen } = useFarmStore();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'liquid', icon: Sparkles, label: 'Liquid' },
    { id: 'spatial', icon: Glasses, label: 'Spatial' },
  ];

  return (
    <div
      className={`p-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl ${
        !sidebarOpen ? 'flex flex-col gap-1' : 'grid grid-cols-2 gap-1 w-full'
      }`}
    >
      {themes.map((t) => {
        const isActive =
          theme === t.id ||
          (t.id === 'liquid' && (theme === 'obsidian' || theme === 'liquid-glass')) ||
          (t.id === 'spatial' && theme === 'spatial-glass');
        const Icon = t.icon;

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              !sidebarOpen ? 'p-2.5' : 'w-full'
            } ${
              isActive
                ? t.id === 'light'
                  ? 'bg-white text-amber-600 shadow-sm border border-amber-200'
                  : t.id === 'dark'
                  ? 'bg-[#15271F] text-emerald-400 shadow-sm border border-[#1C382B]'
                  : t.id === 'liquid'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'bg-sky-500/25 text-sky-300 shadow-md border border-sky-400/40'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
            title={t.label}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {sidebarOpen && <span className="text-[11px] font-bold truncate">{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
