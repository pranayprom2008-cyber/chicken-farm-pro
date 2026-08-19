'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wheat, AlertCircle, ShoppingCart, TrendingDown, Clock, PackageCheck } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function FeedForecastWidget() {
  const { stats, batches, expenses, theme } = useFarmStore();
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const safeBatches = batches || [];
  const activeBatch = safeBatches.find((b) => b?.status === 'growing') || safeBatches[0];
  const totalChicks = stats?.totalChicks || 0;
  const aliveBirds = totalChicks > 0 ? (stats?.aliveChicks || (activeBatch ? activeBatch.aliveChicks : 0) || 0) : 0;

  // Daily consumption rate: average ~130g per bird per day for mid-cycle broilers
  const dailyBurnKg = aliveBirds > 0 ? Math.round(aliveBirds * 0.13) : 0;
  const feedRemaining = stats?.feedRemaining || 0;
  const totalStockKg = aliveBirds > 0 ? (feedRemaining || Math.round(aliveBirds * 3.5)) : feedRemaining;
  const bagsInStock = Math.floor(totalStockKg / 50);

  // Calculate days of feed left
  const daysRemaining = dailyBurnKg > 0 ? Number((totalStockKg / dailyBurnKg).toFixed(1)) : 0;

  let stockStatus: 'safe' | 'reorder' | 'critical' = 'safe';
  if (aliveBirds > 0) {
    if (daysRemaining < 2.5) stockStatus = 'critical';
    else if (daysRemaining < 5) stockStatus = 'reorder';
  }

  const suggestedReorderBags = aliveBirds > 0 ? Math.max(0, Math.ceil((aliveBirds * 3.8 - totalStockKg) / 50)) : 0;

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
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                stockStatus === 'critical'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : stockStatus === 'reorder'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {stockStatus === 'critical' ? '🚨 Order Now' : stockStatus === 'reorder' ? '🟡 Reorder Soon' : '🟢 Ample Stock'}
            </span>
          </div>

          {/* Large Stock Countdown Card */}
          <div className="p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Estimated Feed Runway
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mt-1 flex items-baseline gap-2">
                <span>{daysRemaining || 0}</span>
                <span className="text-sm font-bold text-[var(--text-muted)]">Days of Feed Left</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Current Silo Stock</span>
              <span className="text-lg font-black text-emerald-400 block mt-0.5">
                ~{bagsInStock} Bags ({totalStockKg.toLocaleString()} kg)
              </span>
            </div>
          </div>

          {/* Consumption Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="p-3 rounded-2xl bg-[var(--bg-input)]/60 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Flock Daily Burn Rate</span>
              <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                {dailyBurnKg.toLocaleString()} kg / Day
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-input)]/60 border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Finisher Deficit</span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">
                +{suggestedReorderBags} Bags needed to harvest
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Feed Conversion Standard: 1.55 FCR</span>
          <span className="text-emerald-400 font-bold">● Auto-calculated</span>
        </div>
      </div>
    </TiltCard>
  );
}
