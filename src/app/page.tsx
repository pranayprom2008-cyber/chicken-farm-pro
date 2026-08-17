'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calculator,
  ShieldCheck,
  Activity,
  Sparkles,
  Plus
} from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import Floating3DChicken from '@/components/Floating3DChicken';
import TiltCard from '@/components/TiltCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useFarmStore } from '@/store/useFarmStore';

export default function HomePage() {
  const { theme, isAuthenticated, stats, batches, syncAll } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  useEffect(() => {
    syncAll();
  }, [syncAll]);

  // Derive live telemetry from real store data
  const totalChicks = stats?.totalChicks ?? 0;
  const aliveChicks = stats?.aliveChicks ?? 0;
  const mortalityPct = stats?.mortalityPercentage ?? 0;

  // Active batch identification and dynamic age calculation
  const activeBatches = batches.filter((b) => b.status === 'growing');
  const primaryActiveBatch = activeBatches[0];

  let batchTrackingText = 'No Active Batches';
  let batchCycleSubtext = 'Ready for flock placement';

  if (primaryActiveBatch) {
    let daysElapsed = primaryActiveBatch.daysElapsed;
    if (!daysElapsed && primaryActiveBatch.startDate) {
      const start = new Date(primaryActiveBatch.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const duration = primaryActiveBatch.durationDays || 45;
    const currentDay = Math.min(duration, Math.max(1, daysElapsed || 1));
    const daysLeft = Math.max(0, duration - currentDay);

    batchTrackingText = `${primaryActiveBatch.batchNumber} • Day ${currentDay}`;
    batchCycleSubtext = `${daysLeft} Days to Harvest (${duration}-Day Cycle)`;
  } else if (batches.length > 0) {
    batchTrackingText = `${batches.length} Closed Batches`;
    batchCycleSubtext = 'All batches completed/sold';
  }

  const livabilityPct = totalChicks > 0 ? ((aliveChicks / totalChicks) * 100).toFixed(1) : '100.0';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden flex flex-col justify-between transition-colors duration-500">
      <LiquidBackground />

      {/* Navigation Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border border-emerald-500/30">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              ChickFarm Pro
            </h2>
            <span className="text-[10px] font-semibold text-emerald-500 block -mt-0.5">
              Commercial Poultry OS • Precision Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Admin Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Floating 3D Rooster & Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 relative"
        >
          <Floating3DChicken size={115} />
          <div className="absolute -top-2 -right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold backdrop-blur-xl shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive 3D OS</span>
          </div>
        </motion.div>

        {/* Large Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[var(--text-primary)] max-w-4xl"
        >
          Smart Poultry Farming,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">
            Precision Reimagined.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-xl text-[var(--text-secondary)] mt-6 max-w-2xl font-normal leading-relaxed"
        >
          Manage every batch, calculate chick costs in real time, and monitor farm biometrics through one intelligent ecosystem.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-8 py-4 rounded-3xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all"
          >
            <span>Enter Farm Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2.5 px-7 py-4 rounded-3xl font-bold text-sm sm:text-base text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-500/50 hover:bg-[var(--bg-card-hover)] shadow-lg backdrop-blur-xl transition-all"
          >
            <Calculator className="w-5 h-5 text-emerald-500" />
            <span>Open 3D Billing Calculator</span>
          </Link>
        </motion.div>

        {/* Dynamic Real Telemetry Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mt-14"
        >
          <TiltCard maxTilt={6} glare={true}>
            <div
              className={`p-6 sm:p-8 rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-2xl ${
                isLiquid ? 'liquid-panel' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      Commercial Flock Telemetry • 3D Biometric OS
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {activeBatches.length > 0 ? 'Live Telemetry & Biometric Tracking' : 'Database Synced • Ready for Flock Placement'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-500">Live Universal Sync</span>
                </div>
              </div>

              {/* Dynamic Real Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Total Chicks</span>
                  <div className="text-2xl font-black text-[var(--text-primary)] mt-1">{totalChicks.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    {totalChicks > 0 ? `${activeBatches.length} Active Flock${activeBatches.length === 1 ? '' : 's'}` : '0 Initial Stock'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Alive Chicks</span>
                  <div className="text-2xl font-black text-emerald-500 mt-1">{aliveChicks.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-500/80 font-semibold">
                    {totalChicks > 0 ? `${livabilityPct}% Livability` : '100% Livability Target'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Mortality Rate</span>
                  <div className="text-2xl font-black text-emerald-500 mt-1">{mortalityPct}%</div>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    {mortalityPct <= 2.5 ? 'Standard Safe' : 'Monitoring Required'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Batch Tracking</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-cyan-300 mt-1 truncate">
                    {batchTrackingText}
                  </div>
                  <span className="text-[10px] text-teal-500 font-semibold block truncate">
                    {batchCycleSubtext}
                  </span>
                </div>
              </div>

              {/* Administrator Details */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Authorized Administrators: <strong>John (Owner)</strong> & <strong>Pranay (Manager & Tech)</strong></span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-500">Real Database Telemetry Active</span>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] w-full">
        <p>© 2026 ChickFarm Pro • Commercial Poultry OS • Precision Edition</p>
      </footer>
    </div>
  );
}
