'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wheat, AlertCircle, ShoppingCart, TrendingDown, Clock, PackageCheck } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function FeedForecastWidget() {
  const { stats, batches, expenses, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const activeBatch = batches.find((b) => b.status === 'growing') || batches[0];
  const aliveBirds = stats.aliveChicks || (activeBatch ? activeBatch.aliveChicks : 4880);

  // Daily consumption rate: average ~130g per bird per day for mid-cycle broilers
  const dailyBurnKg = Math.max(50, Math.round((aliveBirds * 0.13)));
  const totalStockKg = Math.max(200, stats.feedRemaining || (aliveBirds * 3.5));
  const bagsInStock = Math.floor(totalStockKg / 50);

  // Calculate days of feed left
  const daysRemaining = Number((totalStockKg / dailyBurnKg).toFixed(1));

  let stockStatus: 'safe' | 'reorder' | 'critical' = 'safe';
  if (daysRemaining < 2.5) stockStatus = 'critical';
  else if (daysRemaining < 5) stockStatus = 'reorder';

  const suggestedReorderBags = Math.ceil((aliveBirds * 3.8 - totalStockKg) / 50) || 40;

  return (
    <TiltCard maxTilt={5} glare={true}>
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        } flex flex-col justify-between h-full`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  stockStatus === 'critical'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : stockStatus === 'reorder'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Wheat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                  Feed Depletion & Reorder Forecast
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Dynamic flock appetite & stockout prevention gauge
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                stockStatus === 'critical'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : stockStatus === 'reorder'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {stockStatus === 'critical'
                ? '🚨 Urgent Stockout'
                : stockStatus === 'reorder'
                ? '⚠️ Reorder Soon'
                : '✅ Safe Inventory'}
            </span>
          </div>

          {/* Large Hero Metric: Days of Feed Left */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-center my-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Estimated Feed Inventory Runway
            </span>
            <div className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] my-1">
              <span
                className={
                  stockStatus === 'critical'
                    ? 'text-rose-400'
                    : stockStatus === 'reorder'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {daysRemaining}
              </span>{' '}
              <span className="text-xl font-bold text-[var(--text-secondary)]">Days</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Based on {aliveBirds.toLocaleString()} active birds consuming ~{dailyBurnKg} kg/day
            </p>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Total Stock</span>
              <div className="text-lg font-black text-[var(--text-primary)] mt-0.5">
                {totalStockKg.toLocaleString()} kg
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                ~{bagsInStock} Bags (50kg)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Daily Consumption</span>
              <div className="text-lg font-black text-[var(--text-primary)] mt-0.5">
                {dailyBurnKg} kg/day
              </div>
              <span className="text-[11px] text-teal-400 font-semibold">
                ~{(dailyBurnKg / 50).toFixed(1)} Bags/day
              </span>
            </div>
          </div>

          {/* Reorder Recommendation Box */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              stockStatus === 'critical'
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                : stockStatus === 'reorder'
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0 mt-0.5 text-current" />
            <div className="text-xs">
              <span className="font-bold block text-[var(--text-primary)]">
                {stockStatus === 'critical'
                  ? 'Urgent Reorder Alert!'
                  : stockStatus === 'reorder'
                  ? 'Upcoming Feed Order Suggested'
                  : 'Feed Supply on Target'}
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Suggested purchase: <strong>{suggestedReorderBags} bags</strong> of Broiler Finisher feed to cover the remainder of the 45-day cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>Standard 50kg Bag Rate: <strong>₹ 2,150</strong></span>
          <span className="text-emerald-400 font-semibold">Automatic Burn-Rate Tracking</span>
        </div>
      </div>
    </TiltCard>
  );
}
