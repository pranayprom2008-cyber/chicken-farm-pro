"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Bird, DollarSign, TrendingUp,
  BarChart3, FileText, Bell, Users, Settings, LogOut, X, ChevronLeft
} from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { name: 'Batches', href: '/dashboard/batches', icon: Bird },
  { name: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
  { name: 'Revenue', href: '/dashboard/revenue', icon: TrendingUp },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Employees', href: '/dashboard/employees', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, theme, user, logout, notifications } = useFarmStore();
  const isObsidian = theme === 'obsidian';
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full lg:w-[72px] lg:translate-x-0'
        } ${
          isObsidian
            ? 'bg-[var(--bg-sidebar)] border-[var(--border-color)] backdrop-blur-xl'
            : 'bg-[var(--bg-sidebar)] border-[var(--border-color)]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className={`flex items-center justify-center w-10 h-10 rounded-2xl text-white text-lg flex-shrink-0 ${
              isObsidian ? 'bg-gradient-to-br from-violet-500 to-cyan-500' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
            }`}>
              🐔
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className={`text-lg font-bold leading-tight ${isObsidian ? 'obsidian-gradient-text' : 'text-[var(--text-primary)]'}`}>
                  ChickFarm
                </span>
                <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase">Management Pro</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const showBadge = item.name === 'Notifications' && unreadCount > 0;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? isObsidian
                      ? 'bg-violet-500/15 text-violet-400'
                      : theme === 'dark'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-emerald-500/10 text-emerald-600'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm flex-1">{item.name}</span>
                )}
                {showBadge && (
                  <span className={`${sidebarOpen ? '' : 'absolute -top-0.5 -right-0.5'} min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    isObsidian ? 'bg-violet-500' : 'bg-red-500'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-[var(--border-color)] space-y-3 flex-shrink-0">
          {/* Theme Toggle */}
          <div className={`flex ${sidebarOpen ? 'justify-start px-1' : 'justify-center'}`}>
            {sidebarOpen ? (
              <ThemeToggle />
            ) : (
              <button
                onClick={() => useFarmStore.getState().cycleTheme()}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                title="Change theme"
              >
                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '✦'}
              </button>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              isObsidian ? 'bg-violet-500/20 text-violet-300' : 'bg-emerald-500 text-white'
            }`}>
              {initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user?.role === 'admin' ? 'Admin' : user?.phone || 'User'}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
