'use client';

import React, { useEffect } from 'react';
import { RefreshCw, LayoutDashboard, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error Boundary caught error:', error);
  }, [error]);

  const handleRecover = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chickfarm-master-persistence-v3');
      }
    } catch {}
    reset();
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-[var(--bg-card)] shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Dashboard Self-Recovery
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
            Telemetry is re-syncing with Cloudflare D1. Click below to refresh your view.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={handleRecover}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-Sync & Load Live Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
