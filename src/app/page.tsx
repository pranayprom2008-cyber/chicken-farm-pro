'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (useFarmStore.getState().isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [router, mounted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Loading ChickFarm Pro...</p>
      </div>
    </div>
  );
}
