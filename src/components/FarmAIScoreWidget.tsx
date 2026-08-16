'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles, ShieldCheck, TrendingUp, AlertTriangle, ChevronRight, Activity, Percent, Wheat, DollarSign } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import { ChickAIEngine } from '@/lib/chickai/engine';
import TiltCard from '@/components/TiltCard';

export default function FarmAIScoreWidget() {
  const { stats, batches, expenses, sales, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  // Compute live Farm AI Score
  const engine = new ChickAIEngine({
    batches,
    expenses,
    sales,
    billingHistory: [],
    stats,
    settings: {},
  });

  const score = engine.calculateFarmAIScore();

  return (
    <TiltCard maxTilt={4} glare={true}>
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        } flex flex-col justify-between h-full relative overflow-hidden`}
      >
        {/* Ambient background aura */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-[14px] bg-[#0A1610] flex items-center justify-center text-emerald-400 font-black">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>Farm AI Score</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                    Grade {score.grade}
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Autonomous biometric & financial rating (0 - 100)
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                {score.overall}
                <span className="text-xs text-[var(--text-muted)] font-normal ml-0.5">/ 100</span>
              </div>
            </div>
          </div>

          {/* Subcategory Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4 text-center">
            <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Flock Health</span>
              <span className="text-base font-black text-emerald-400 mt-0.5 block">{score.batchHealth}</span>
              <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${score.batchHealth}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Mortality</span>
              <span className="text-base font-black text-teal-400 mt-0.5 block">{score.mortalityControl}</span>
              <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: `${score.mortalityControl}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Feed FCR</span>
              <span className="text-base font-black text-amber-400 mt-0.5 block">{score.feedEfficiency}</span>
              <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${score.feedEfficiency}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Cost Control</span>
              <span className="text-base font-black text-cyan-400 mt-0.5 block">{score.expenseControl}</span>
              <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${score.expenseControl}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Profitability</span>
              <span className="text-base font-black text-emerald-300 mt-0.5 block">{score.profitability}</span>
              <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${score.profitability}%` }} />
              </div>
            </div>
          </div>

          {/* Diagnostic Commentary Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="leading-relaxed">
              <strong className="text-white">AI Diagnostic Insight:</strong> {score.opportunityNote}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>Continuous Real-Time Scoring</span>
          <span className="text-emerald-400 font-semibold">ChickAI Core Diagnostic</span>
        </div>
      </div>
    </TiltCard>
  );
}
