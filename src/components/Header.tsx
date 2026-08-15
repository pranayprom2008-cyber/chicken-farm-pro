"use client";

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/billing': 'Billing',
  '/dashboard/batches': 'Batches',
  '/dashboard/expenses': 'Expenses',
  '/dashboard/revenue': 'Revenue',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/reports': 'Reports',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/employees': 'Employees',
  '/dashboard/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar, user, theme, notifications } = useFarmStore();
  const isObsidian = theme === 'obsidian';
  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';

  const pageTitle = pageTitles[pathname || ''] || 'Dashboard';

  return (
    <header className={`sticky top-0 z-30 h-16 backdrop-blur-xl border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 ${
      isObsidian ? 'bg-[var(--bg-header)]' : 'bg-[var(--bg-header)]'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--text-primary)] hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className={`w-56 pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 ${
              isObsidian
                ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-500 focus:border-violet-500/50'
                : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-gray-400 focus:border-emerald-500'
            }`}
          />
        </div>

        {/* Notifications */}
        <button className={`relative p-2 rounded-xl transition-all duration-200 ${
          isObsidian
            ? 'text-[var(--text-secondary)] hover:text-violet-400 hover:bg-violet-500/10'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
        }`}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white ${
              isObsidian ? 'bg-violet-500' : 'bg-red-500'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 ${
          isObsidian
            ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}>
          {initials}
        </div>
      </div>
    </header>
  );
}
