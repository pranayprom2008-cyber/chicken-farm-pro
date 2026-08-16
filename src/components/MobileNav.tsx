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
  Menu
} from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';

export default function MobileNav() {
  const pathname = usePathname();
  const { theme, toggleSidebar } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
    { name: 'Batches', href: '/dashboard/batches', icon: Bird },
    { name: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
  ];

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t px-2 flex items-center justify-around backdrop-blur-2xl transition-all ${
        isLiquid
          ? 'bg-[var(--bg-sidebar)]/90 border-white/10 shadow-[0_-8px_25px_rgba(0,0,0,0.5)]'
          : 'bg-[var(--bg-sidebar)]/95 border-[var(--border-color)] shadow-[0_-4px_15px_rgba(0,0,0,0.05)]'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative select-none ${
              isActive
                ? isLiquid
                  ? 'text-cyan-300 font-bold'
                  : 'text-emerald-500 dark:text-emerald-400 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeMobileNavPill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={`absolute top-1.5 w-8 h-1 rounded-full ${
                  isLiquid ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]' : 'bg-emerald-500'
                }`}
              />
            )}
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium select-none"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-tight">More</span>
      </button>
    </nav>
  );
}
