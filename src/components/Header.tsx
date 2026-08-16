'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
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
  const { toggleSidebar, user, theme, notifications } = useFarmStore();
  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass';
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF';

  const pageTitle = pageTitles[pathname || ''] || 'Dashboard';

  return (
    <header
      className={`sticky top-0 z-30 h-16 backdrop-blur-xl border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 ${
        isLiquid ? 'bg-[var(--bg-header)]' : 'bg-[var(--bg-header)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-all duration-200 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[var(--text-primary)] hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search farm records..."
            className="w-56 pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all"
          />
        </div>

        {/* Notifications Shortcut */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-rose-500">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <Link
          href="/dashboard/settings"
          className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
            isLiquid
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-emerald-500 text-white'
          }`}
          title="User Profile & Settings"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
