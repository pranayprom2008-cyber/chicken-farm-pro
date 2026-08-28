'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LiquidBackground from '@/components/LiquidBackground';
import Floating3DChicken from '@/components/Floating3DChicken';

export default function RootPage() {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState === 'AUTHENTICATED') {
      router.replace('/dashboard');
    } else if (authState === 'UNAUTHENTICATED') {
      router.replace('/login');
    } else if (authState === 'UNAUTHORIZED') {
      router.replace('/login');
    } else if (authState === 'ERROR') {
      router.replace('/login');
    }
    // LOADING: wait for Supabase to finish session resolution
  }, [authState, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LiquidBackground />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <div className="mb-2">
          <Floating3DChicken size={84} />
        </div>
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
          Chicken Farm Pro
        </h2>
        <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
          Restoring your session...
        </p>
      </div>
    </div>
  );
}
