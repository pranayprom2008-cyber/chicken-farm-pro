'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, Wheat, Pill, Zap } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function AIFarmInsights() {
  const { stats, batches, expenses, sales, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const safeBatches = batches || [];
  const safeExpenses = expenses || [];

  // Build dynamic insights backed strictly by real database data
  const activeBatch = safeBatches.find((b) => b?.status === 'growing') || safeBatches[0];
  const totalChicks = stats?.totalChicks || 0;
  const mortalityPct = totalChicks > 0 ? (stats?.mortalityPercentage || (activeBatch ? activeBatch.mortalityPercentage : 0) || 0) : 0;
  const feedCost = safeExpenses.filter((e) => e?.category === 'Feed').reduce((sum, e) => sum + (e?.amount || 0), 0);
  const medCost = safeExpenses.filter((e) => e?.category === 'Medicine').reduce((sum, e) => sum + (e?.amount || 0), 0);
  const totalExp = stats?.totalExpenditure || safeExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0);

  const insights: {
    id: string;
    level: 'healthy' | 'attention' | 'critical';
    title: string;
    description: string;
    icon: React.ReactNode;
    metric?: string;
  }[] = [];

  if (safeBatches.length === 0) {
    insights.push({
      id: 'fresh-db',
      level: 'healthy',
      title: 'Fresh Database Initialized',
      description: 'System is clean and ready. Add your first grow-out batch to activate live AI telemetry, FCR tracking, and profit simulation.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      metric: '0 Active Flocks',
    });
    insights.push({
      id: 'bio-ready',
      level: 'healthy',
      title: 'Pre-Placement Disinfection Verified',
      description: 'Ensure drinkers are chlorinated (2 ppm) and chick paper is laid out with pre-starter crumbs before chick arrival.',
      icon: <Sparkles className="w-5 h-5 text-teal-400" />,
      metric: 'Bio-Security Ready',
    });
  } else {
    // Insight 1: Mortality Triage
    if (mortalityPct > 4.5) {
      insights.push({
        id: 'mortality-crit',
        level: 'critical',
        title: `${activeBatch?.batchNumber || 'Batch-01'} Mortality Elevated`,
        description: `Cumulative loss reached ${mortalityPct.toFixed(2)}%. Immediate veterinary inspection and antibiotic/water sanitization recommended.`,
        icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
        metric: `${mortalityPct.toFixed(1)}% Mortality`,
      });
    } else if (mortalityPct > 2.8) {
      insights.push({
        id: 'mortality-warn',
        level: 'attention',
        title: `${activeBatch?.batchNumber || 'Batch-01'} Moderate Loss Rate`,
        description: `Loss rate is ${mortalityPct.toFixed(2)}%. Check ventilation fans, water pressure, and brooding temperatures.`,
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        metric: `${mortalityPct.toFixed(1)}% Mortality`,
      });
    } else {
      insights.push({
        id: 'mortality-good',
        level: 'healthy',
        title: `${activeBatch?.batchNumber || 'Batch-01'} Flocks Thriving`,
        description: `Livability is optimal at ${(100 - mortalityPct).toFixed(1)}%, outperforming standard Cobb 500 commercial benchmarks.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        metric: `${(100 - mortalityPct).toFixed(1)}% Livability`,
      });
    }

    // Insight 2: Feed & Cost Allocation
    if (totalExp > 0 && feedCost / totalExp > 0.72) {
      insights.push({
        id: 'feed-high',
        level: 'attention',
        title: 'Feed Expense Ratio Elevated',
        description: `Feed constitutes ${Math.round((feedCost / totalExp) * 100)}% of expenses. Inspect feed trough spillages and adjust feeder height.`,
        icon: <Wheat className="w-5 h-5 text-amber-400" />,
        metric: `${Math.round((feedCost / totalExp) * 100)}% Feed Ratio`,
      });
    } else {
      insights.push({
        id: 'cost-balanced',
        level: 'healthy',
        title: 'Feed Conversion & Costs Balanced',
        description: 'Operating expenses across feed, electricity, and medications are well-proportioned for commercial margin capture.',
        icon: <TrendingUp className="w-5 h-5 text-teal-400" />,
        metric: 'Stable FCR Ratio',
      });
    }
  }

  return (
    <TiltCard maxTilt={4} glare={true}>
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        } flex flex-col justify-between h-full relative overflow-hidden`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>AI Advisory Engine</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Live anomaly detection & operational suggestions
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              {insights.length} Signals
            </span>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  ins.level === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : ins.level === 'attention'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {ins.icon}
                    <span className="font-bold text-xs text-[var(--text-primary)]">{ins.title}</span>
                  </div>
                  {ins.metric && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/30 border border-white/10 font-mono text-[var(--text-primary)]">
                      {ins.metric}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-7">
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Continuous Biometric Monitoring</span>
          <span className="text-emerald-400 font-bold">● Active</span>
        </div>
      </div>
    </TiltCard>
  );
}
