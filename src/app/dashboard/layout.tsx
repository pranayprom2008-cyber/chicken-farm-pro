'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useFarmStore } from '@/store/useFarmStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LiquidBackground from '@/components/LiquidBackground';
import PageTransition from '@/components/PageTransition';
import MobileNav from '@/components/MobileNav';
import ChickAI from '@/components/ChickAI';
import Floating3DChicken from '@/components/Floating3DChicken';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authState } = useAuth();
  const { syncAll } = useFarmStore();

  useEffect(() => {
    if (authState === 'UNAUTHENTICATED') {
      router.replace('/login');
    }
  }, [authState, router]);

  // Background sync while authenticated
  useEffect(() => {
    if (authState !== 'AUTHENTICATED') return;

    syncAll();
    const syncInterval = setInterval(() => {
      syncAll();
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncAll();
      }
    };

    window.addEventListener('focus', syncAll);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', syncAll);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [authState, syncAll]);

  // LOADING: show spinner while session restores
  if (authState === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
        <LiquidBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <Floating3DChicken size={84} />
          <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
            Restoring your farm session...
          </p>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: render the actual dashboard
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
