'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, Sparkles, Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/dashboard/billing': 'Billing Calculator',
  '/dashboard/batches': 'Batch Management',
  '/dashboard/expenses': 'Expense Management',
  '/dashboard/revenue': 'Revenue & Sales',
  '/dashboard/analytics': 'Farm Analytics',
  '/dashboard/reports': 'Audit Reports',
  '/dashboard/notifications': 'Notifications & Reminders',
  '/dashboard/employees': 'Employee Management',
  '/dashboard/settings': 'System Settings',
};

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar, user, notifications, stats } = useFarmStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF';
  const [searchFocused, setSearchFocused] = useState(false);

  const pageTitle = pageTitles[pathname || ''] || 'Dashboard';

  return (
    <header className="sticky top-3 z-30 mx-3.5 sm:mx-6 lg:mx-8 mb-4 h-16 rounded-2xl bg-[var(--bg-header)] border border-[var(--border-color)] backdrop-blur-2xl shadow-xl flex items-center justify-between px-4 lg:px-6 flex-shrink-0 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-white/10 transition-all duration-200 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{(stats?.aliveChicks || 0).toLocaleString()} Live Birds • Real-Time Database Telemetry</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Spatial Search Bar (Expands smoothly on focus) */}
        <div className="relative hidden md:block">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`} />
          <input
            type="text"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search farm records, batches..."
            className={`pl-9 pr-4 py-2 rounded-xl border text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all duration-300 ${
              searchFocused
                ? 'w-72 bg-[var(--bg-input)] border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'w-52 bg-[var(--bg-input)] border-[var(--border-color)]'
            }`}
          />
        </div>

        {/* Notifications Shortcut */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute 1 top-1.5 right-1.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold text-white bg-rose-500 shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar */}
        <Link
          href="/dashboard/settings"
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/30 cursor-pointer"
          title="User Profile & Settings"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
