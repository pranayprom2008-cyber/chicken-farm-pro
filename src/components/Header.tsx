'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, Sparkles, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

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
  const [searchFocused, setSearchFocused] = useState(false);

  const displayEmail = user?.email || (user?.name ? `${user.name}` : 'Google Account');
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : (user?.name?.length ? user.name.slice(0, 2).toUpperCase() : 'CF');

  const pageTitle = pageTitles[pathname || ''] || 'Dashboard';

  return (
    <header className="sticky top-3 z-30 mx-3.5 sm:mx-6 lg:mx-8 mb-4 h-16 rounded-2xl bg-[var(--bg-header)] border border-[var(--border-color)] backdrop-blur-2xl shadow-xl flex items-center justify-between px-3 sm:px-4 lg:px-6 flex-shrink-0 transition-all duration-300 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-white/10 transition-all duration-200 lg:hidden cursor-pointer flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight truncate">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{(stats?.aliveChicks || 0).toLocaleString()} Live Birds • Real-Time Telemetry</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* 🟢 ALWAYS-VISIBLE SIGNED IN EMAIL BADGE */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-mono uppercase tracking-wider font-bold">
              Signed In
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-white max-w-[120px] sm:max-w-[220px] md:max-w-[320px] truncate">
              {displayEmail}
            </span>
          </div>
        </div>

        {/* Spatial Search Bar */}
        <div className="relative hidden xl:block">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`} />
          <input
            type="text"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search farm records..."
            className={`pl-9 pr-4 py-2 rounded-xl border text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all duration-300 ${
              searchFocused
                ? 'w-56 bg-[var(--bg-input)] border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'w-44 bg-[var(--bg-input)] border-[var(--border-color)]'
            }`}
          />
        </div>

        {/* Notifications Shortcut */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 sm:p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[9px] font-bold text-white bg-rose-500 shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Quick Header Theme Switcher */}
        <div className="hidden sm:block">
          <ThemeToggle inHeader />
        </div>

        {/* User Profile Avatar with Exact Email Initials */}
        <Link
          href="/dashboard/settings"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/30 cursor-pointer flex-shrink-0 overflow-hidden"
          title={`${displayEmail} (Active Farm Vault)`}
        >
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </Link>
      </div>
    </header>
  );
}
