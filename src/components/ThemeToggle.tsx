'use client';

import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';

export default function ThemeToggle() {
  const { theme, setTheme, sidebarOpen } = useFarmStore();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'liquid', icon: Sparkles, label: 'Liquid' },
  ];

  return (
    <div
      className={`flex items-center p-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl ${
        !sidebarOpen ? 'flex-col gap-1' : 'gap-1 w-full justify-between'
      }`}
    >
      {themes.map((t) => {
        const isActive =
          theme === t.id ||
          (t.id === 'liquid' && (theme === 'obsidian' || theme === 'liquid-glass'));
        const Icon = t.icon;

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              sidebarOpen ? 'flex-1' : 'p-2.5'
            } ${
              isActive
                ? t.id === 'light'
                  ? 'bg-white text-amber-600 shadow-sm border border-amber-200'
                  : t.id === 'dark'
                  ? 'bg-[#15271F] text-emerald-400 shadow-sm border border-[#1C382B]'
                  : 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title={t.label}
          >
            <Icon className="w-4 h-4" />
            {sidebarOpen && <span className="text-[12px] truncate">{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
