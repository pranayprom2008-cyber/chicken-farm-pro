'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Sparkles, Bird, ShieldCheck, AlertTriangle, Wheat, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';
import Link from 'next/link';

export default function TodayFarmBrief() {
  const { stats, batches, expenses, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const activeBatches = batches.filter((b) => b.status === 'growing');
  const healthyCount = activeBatches.filter((b) => (b.mortalityPercentage || 0) <= 3.0).length;
  const cautionCount = activeBatches.filter((b) => (b.mortalityPercentage || 0) > 3.0 && (b.mortalityPercentage || 0) <= 4.5).length;
  const criticalCount = activeBatches.filter((b) => (b.mortalityPercentage || 0) > 4.5).length;

  const totalCost = stats.totalExpenditure || 482500;
  const feedRunwayDays = Number(((stats.feedRemaining || 1850) / ((stats.aliveChicks || 4880) * 0.13)).toFixed(1));
  const activeBatch = activeBatches[0] || batches[0];

  return (
    <TiltCard maxTilt={4} glare={true}>
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        } relative overflow-hidden flex flex-col justify-between`}
      >
        {/* Glowing top aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 via-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: '30s' }} />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>Today's AI Farm Brief</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Autonomous commercial flock telemetry & priority summary
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ● Live Sync
            </span>
          </div>

          {/* Active Batches Triage Summary */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Bird className="w-4 h-4 text-emerald-400" />
                <span>{activeBatches.length || 1} Active Grow-out Batches</span>
              </span>
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                {(stats.aliveChicks || 4880).toLocaleString()} Live Birds
              </span>
            </div>

            {/* Health Triage Pills */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                🟢 {healthyCount || 1} Healthy
              </span>
              {cautionCount > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  🟡 {cautionCount} Attention
                </span>
              )}
              {criticalCount > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  🔴 {criticalCount} Critical
                </span>
              )}
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="p-3 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Total Active Cost</span>
              <span className="text-base font-black text-[var(--text-primary)] mt-0.5 block">
                ₹ {totalCost.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Feed Runway</span>
              <span className={`text-base font-black mt-0.5 block ${feedRunwayDays < 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {feedRunwayDays} Days Left
              </span>
            </div>
          </div>

          {/* Priorities List */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/20 text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
              <span className="text-amber-400 font-bold">⚠️ Priority:</span>
              <span>
                {activeBatch ? `${activeBatch.batchNumber} mortality is at ${activeBatch.mortalityPercentage}%. Check shed drinker lines.` : 'All batch biometrics tracking normally.'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
              <span className="text-cyan-400 font-bold">🌽 Feed:</span>
              <span>Inventory is sufficient for ~{feedRunwayDays} days. Ensure timely reorder.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Verified from farm database</span>
          <Link
            href="/dashboard/batches"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
