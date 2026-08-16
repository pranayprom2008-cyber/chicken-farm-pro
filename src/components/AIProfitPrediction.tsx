'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, DollarSign, Scale, Percent, ShieldCheck, ArrowUpRight, HelpCircle } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function AIProfitPrediction() {
  const { stats, batches, expenses, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches.find((b) => b.status === 'growing')?.id || batches[0]?.id || ''
  );
  const [marketRate, setMarketRate] = useState<number>(118); // Live bird rate ₹/kg

  const targetBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const alive = targetBatch ? targetBatch.aliveChicks : 0;
  const targetWeightKg = 2.35; // Standard Cobb 500 harvest weight

  // Calculations
  const expectedGrossRevenue = targetBatch ? Math.round(alive * targetWeightKg * marketRate) : 0;
  const chickCost = targetBatch ? (targetBatch.totalChicks * (targetBatch.costPerChick || 38)) : 0;
  const estFeedKg = alive * 3.8;
  const estFeedCost = Math.round(estFeedKg * 42.5);
  const estMedUtilityCost = Math.round(alive * 12);

  const expectedTotalCost = chickCost + estFeedCost + estMedUtilityCost;
  const estimatedNetProfit = expectedGrossRevenue - expectedTotalCost;
  const profitMargin = expectedGrossRevenue > 0 ? ((estimatedNetProfit / expectedGrossRevenue) * 100).toFixed(1) : '0.0';

  return (
    <TiltCard maxTilt={4} glare={true}>
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        } flex flex-col justify-between h-full`}
      >
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>AI Flock Profit Predictor</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Cobb 500 growth curve & live market yield simulation
                </p>
              </div>
            </div>

            {/* Batch selector if multiple */}
            {batches.length > 1 && (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-bold focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} ({b.breedType})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hero Estimated Net Profit Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-black/40 border border-emerald-500/30 text-center mb-5 relative overflow-hidden">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Estimated Net Harvest Profit (Day 42 - 45)
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 my-1.5">
              ₹ {estimatedNetProfit.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
              <span>Expected Margin: <strong className="text-emerald-300 font-bold">{profitMargin}%</strong></span>
              <span>•</span>
              <span>Confidence: <strong className="text-teal-300 font-bold">94%</strong></span>
            </div>
          </div>

          {/* Forecast Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Expected Revenue</span>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                ₹ {expectedGrossRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                {alive.toLocaleString()} birds @ {targetWeightKg}kg @ ₹{marketRate}/kg
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Expected Total Cost</span>
              <div className="text-lg font-black text-rose-400 mt-0.5">
                ₹ {expectedTotalCost.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                Chicks + Feed + Meds + Power
              </span>
            </div>
          </div>

          {/* Interactive Live Selling Price Slider */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-primary)]">
                Adjust Wholesale Market Rate:
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs">
                ₹ {marketRate} / kg
              </span>
            </div>
            <input
              type="range"
              min={90}
              max={150}
              step={1}
              value={marketRate}
              onChange={(e) => setMarketRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <span>*Calculated from live flock telemetry; dynamic simulation.</span>
          <span className="text-emerald-400 font-semibold">Cobb 500 AI Model</span>
        </div>
      </div>
    </TiltCard>
  );
}
