'use client';

import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';

export default function ThemeToggle({ inHeader = false }: { inHeader?: boolean }) {
  const { theme, setTheme, sidebarOpen } = useFarmStore();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'vibe', icon: Sparkles, label: 'Vibe' },
  ];

  const isVertical = !inHeader && !sidebarOpen;

  return (
    <div
      className={`p-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl flex items-center gap-1 ${
        isVertical ? 'flex-col' : 'flex-row'
      }`}
    >
      {themes.map((t) => {
        const isActive =
          theme === t.id ||
          (t.id === 'dark' &&
            (theme === 'spatial' ||
              theme === 'spatial-glass' ||
              theme === 'liquid' ||
              theme === 'obsidian' ||
              theme === 'liquid-glass'));
        const Icon = t.icon;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id as any)}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              isActive
                ? t.id === 'light'
                  ? 'bg-white text-amber-600 shadow-sm border border-amber-200'
                  : t.id === 'dark'
                  ? 'bg-[#15271F] text-emerald-400 shadow-sm border border-[#1C382B]'
                  : 'bg-purple-600/30 text-purple-200 shadow-md border border-purple-400/40'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
            title={t.label}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {(inHeader || sidebarOpen) && <span className="text-[11px] font-bold truncate">{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
