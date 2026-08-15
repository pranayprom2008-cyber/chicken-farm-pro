"use client";

import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';

export default function ThemeToggle() {
  const { theme, setTheme, sidebarOpen } = useFarmStore();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'obsidian', icon: Sparkles, label: 'Obsidian' }
  ];

  return (
    <div className={`flex items-center p-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full ${!sidebarOpen ? 'flex-col gap-2' : 'gap-1'}`}>
      {themes.map((t) => {
        const isActive = theme === t.id;
        let activeStyles = 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]';
        
        if (isActive) {
          if (t.id === 'light') activeStyles = 'bg-amber-100 text-amber-600 shadow-sm';
          else if (t.id === 'dark') activeStyles = 'bg-emerald-900 text-emerald-400 shadow-sm';
          else if (t.id === 'obsidian') activeStyles = 'bg-violet-500/20 text-violet-400 shadow-sm';
        }

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`p-2 rounded-full transition-all duration-200 relative group ${activeStyles}`}
            title={t.label}
          >
            <t.icon className="w-4 h-4" />
            <span className="sr-only">{t.label}</span>
            {/* Tooltip */}
            <div className={`absolute ${sidebarOpen ? '-top-10 left-1/2 -translate-x-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'} px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50`}>
              {t.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
