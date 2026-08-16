'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Bird,
  DollarSign,
  TrendingUp,
  BarChart3,
  FileText,
  Bell,
  Users,
  Settings,
  LogOut,
  X,
  Sun,
  Moon,
  Sparkles
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
  const { sidebarOpen, setSidebarOpen, theme, setTheme, user, logout, notifications } = useFarmStore();
  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF';
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('liquid');
    else setTheme('light');
  };

  return (
    <>
      {/* Mobile overlay with smooth fade */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarOpen ? 'w-[275px] translate-x-0' : 'w-0 -translate-x-full lg:w-[80px] lg:translate-x-0'
        } ${
          isLiquid
            ? 'bg-[var(--bg-sidebar)] border-[var(--border-color)] backdrop-blur-2xl'
            : 'bg-[var(--bg-sidebar)] border-[var(--border-color)]'
        }`}
      >
        {/* Brand Logo with Custom Logo Badge */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center gap-3.5 overflow-hidden whitespace-nowrap">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
              transition={{ duration: 0.35 }}
              className="flex-shrink-0 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="ChickFarm Pro Logo"
                className={`w-11 h-11 rounded-2xl object-cover shadow-lg border transition-all ${
                  isLiquid
                    ? 'border-cyan-400/40 shadow-cyan-500/25'
                    : 'border-emerald-500/30 shadow-emerald-500/25'
                }`}
              />
            </motion.div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  ChickFarm
                </span>
                <span className="text-[11px] text-[var(--text-muted)] tracking-widest uppercase font-bold mt-0.5">
                  Management Pro
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items with Fluid Animated Indicator */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const showBadge = item.name === 'Notifications' && unreadCount > 0;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 relative group select-none ${
                  isActive
                    ? isLiquid
                      ? 'text-cyan-300 font-bold'
                      : 'text-white font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                {/* Fluid Sliding Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                    className={`absolute inset-0 rounded-2xl ${
                      isLiquid
                        ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/15'
                        : 'bg-emerald-500 shadow-md shadow-emerald-500/25'
                    }`}
                  />
                )}

                <Icon
                  className={`w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? isLiquid
                        ? 'text-cyan-300'
                        : 'text-white'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }`}
                />

                {sidebarOpen && (
                  <span className="text-[15px] tracking-tight flex-1 relative z-10">
                    {item.name}
                  </span>
                )}

                {showBadge && (
                  <span
                    className={`${
                      sidebarOpen ? '' : 'absolute -top-0.5 -right-0.5'
                    } min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full text-[11px] font-bold text-white bg-rose-500 shadow-sm relative z-10`}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile & Theme Engine */}
        <div className="p-3.5 border-t border-[var(--border-color)] space-y-3 flex-shrink-0">
          {/* Theme Toggle */}
          <div className={`flex ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            {sidebarOpen ? (
              <ThemeToggle />
            ) : (
              <button
                onClick={cycleTheme}
                className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                title="Change theme"
              >
                {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : theme === 'dark' ? <Moon className="w-5 h-5 text-emerald-400" /> : <Sparkles className="w-5 h-5 text-cyan-400" />}
              </button>
            )}
          </div>

          {/* User Profile Tile */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] overflow-hidden transition-all duration-200 hover:border-[var(--border-hover)]">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                isLiquid
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate tracking-tight">
                  {user?.name || 'Authorized Farmer'}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate font-medium">
                  {user?.role || 'Admin'}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
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
