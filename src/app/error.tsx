'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught error:', error);
  }, [error]);

  const handleHardRecover = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chickfarm-master-persistence-v3');
      }
    } catch {}
    reset();
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A120E] text-white">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-[#0e1f17] shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Auto-Recovery Ready
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            The workspace encountered a rendering glitch while synchronizing. Your cloud data is safe and intact.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={handleHardRecover}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recover & Reload Dashboard</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
