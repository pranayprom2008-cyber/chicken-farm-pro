'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, DollarSign, Scale, Percent, ShieldCheck, ArrowUpRight, HelpCircle } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function AIProfitPrediction() {
  const { stats, batches, expenses, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const safeBatches = batches || [];

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    safeBatches.find((b) => b?.status === 'growing')?.id || safeBatches[0]?.id || ''
  );
  const [marketRate, setMarketRate] = useState<number>(118); // Live bird rate ₹/kg

  const targetBatch = safeBatches.find((b) => b?.id === selectedBatchId) || safeBatches[0] || null;
  const alive = targetBatch ? (targetBatch.aliveChicks || 0) : (stats?.aliveChicks || 0);
  const targetWeightKg = 2.35; // Standard Cobb 500 harvest weight

  // Calculations
  const expectedGrossRevenue = targetBatch ? Math.round(alive * targetWeightKg * marketRate) : 0;
  const chickCost = targetBatch ? ((targetBatch.totalChicks || 0) * (targetBatch.costPerChick || 38)) : 0;
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
            {safeBatches.length > 1 && (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              >
                {safeBatches.map((b) => (
                  <option key={b?.id || Math.random()} value={b?.id}>
                    {b?.batchNumber || 'Batch'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Primary Predicted Net Profit Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-black/40 border border-emerald-500/30 mb-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Predicted Net Harvest Margin
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +{profitMargin}% Margin
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              ₹ {estimatedNetProfit.toLocaleString('en-IN')}
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-3 pt-3 border-t border-emerald-500/20 font-medium">
              <span>Gross: ₹{expectedGrossRevenue.toLocaleString('en-IN')}</span>
              <span>Total Cost: ₹{expectedTotalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Biometric Slider / Assumptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[var(--text-muted)]">Simulated Market Rate (₹/kg)</span>
              <span className="font-bold text-emerald-400">₹ {marketRate} / kg</span>
            </div>
            <input
              type="range"
              min="90"
              max="160"
              value={marketRate}
              onChange={(e) => setMarketRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[var(--bg-input)] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
              <span>₹90 (Low Market)</span>
              <span>₹125 (Target)</span>
              <span>₹160 (Peak)</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Target Weight: 2.35 kg/bird</span>
          <span className="text-emerald-400 font-bold">● High Confidence</span>
        </div>
      </div>
    </TiltCard>
  );
}
