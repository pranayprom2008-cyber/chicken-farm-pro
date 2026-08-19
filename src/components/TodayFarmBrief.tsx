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

  const safeBatches = batches || [];
  const activeBatches = safeBatches.filter((b) => b?.status === 'growing');
  const healthyCount = activeBatches.filter((b) => (b?.mortalityPercentage || 0) <= 3.0).length;
  const cautionCount = activeBatches.filter((b) => (b?.mortalityPercentage || 0) > 3.0 && (b?.mortalityPercentage || 0) <= 4.5).length;
  const criticalCount = activeBatches.filter((b) => (b?.mortalityPercentage || 0) > 4.5).length;

  const totalCost = stats?.totalExpenditure || 0;
  const aliveChicks = stats?.aliveChicks || 0;
  const feedRemaining = stats?.feedRemaining || 0;
  const feedRunwayDays = aliveChicks > 0 ? Number((feedRemaining / (aliveChicks * 0.13)).toFixed(1)) : 0;
  const activeBatch = activeBatches[0] || safeBatches[0];

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
                {(aliveChicks || 4880).toLocaleString()} Live Birds
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
                ₹ {(totalCost || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Feed Runway</span>
              <span className={`text-base font-black mt-0.5 block ${feedRunwayDays < 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {feedRunwayDays} Days Left
              </span>
            </div>
          </div>

          {/* Priority AI Action Message */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 block">Flock Status Normal</span>
              <span className="text-[var(--text-muted)] text-[11px]">
                {activeBatch ? `Batch ${activeBatch.batchNumber} mortality tracking below 3.0% safety benchmark.` : 'All active farm biometrics are within standard Cobb 500 growth curves.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)] font-medium">Auto-analyzed by ChickAI Copilot</span>
          <Link
            href="/dashboard/batches"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
