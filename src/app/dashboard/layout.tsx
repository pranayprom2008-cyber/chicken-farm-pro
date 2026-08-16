'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LiquidBackground from '@/components/LiquidBackground';
import PageTransition from '@/components/PageTransition';
import MobileNav from '@/components/MobileNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, isAuthenticated, syncAll } = useFarmStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncAll();

    const syncInterval = setInterval(() => {
      syncAll();
    }, 15000);

    return () => clearInterval(syncInterval);
  }, [syncAll]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      syncAll();
    }
  }, [pathname, mounted, isAuthenticated, syncAll]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark', 'obsidian', 'liquid-glass', 'liquid', 'organic', 'bubble');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass') {
        document.documentElement.classList.add('liquid', 'liquid-glass', 'obsidian');
      }
    }
  }, [theme]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 relative">
      <LiquidBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
