"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuroraBackground from '@/components/aurora/AuroraBackground';
import CursorGlow from '@/components/aurora/CursorGlow';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, theme, isAuthenticated } = useFarmStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'obsidian');
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'obsidian') root.classList.add('obsidian');
  }, [theme]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {theme === 'obsidian' && (
        <>
          <AuroraBackground />
          <CursorGlow />
        </>
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
