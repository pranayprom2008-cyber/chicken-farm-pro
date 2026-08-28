'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LiquidBackground from '@/components/LiquidBackground';
import Floating3DChicken from '@/components/Floating3DChicken';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LiquidBackground />
      <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center max-w-sm">
        <Floating3DChicken size={84} />
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          Redirecting to Farm Dashboard...
        </h2>
      </div>
    </div>
  );
}
