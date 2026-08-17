'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LiquidBackground from '@/components/LiquidBackground';
import PageTransition from '@/components/PageTransition';
import MobileNav from '@/components/MobileNav';
import ChickAI from '@/components/ChickAI';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, isAuthenticated, syncAll } = useFarmStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Real-time Cloud Sync Engine (Cross-device real-time sync & fast revalidation)
  useEffect(() => {
    setMounted(true);
    syncAll();

    // 1. Periodic background sync every 4 seconds
    const syncInterval = setInterval(() => {
      syncAll();
    }, 4000);

    // 2. Real-time sync on window focus or tab visibility change
    const handleFocus = () => {
      syncAll();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncAll();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LiquidBackground />

      {/* Primary Sidebar Desktop */}
      <Sidebar />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header />

        <main className="flex-1 p-3.5 sm:p-5 md:p-7 max-w-[1700px] w-full mx-auto pb-24 md:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile Navigation Dock */}
      <MobileNav />

      {/* ChickAI Voice & Intelligence Assistant */}
      <ChickAI />
    </div>
  );
}
