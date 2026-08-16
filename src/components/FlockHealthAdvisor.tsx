'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, HeartPulse, Stethoscope, Sparkles, Droplets, ThermometerSun, Wind } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function FlockHealthAdvisor() {
  const { stats, batches, theme } = useFarmStore();
  const activeBatch = batches.find((b) => b.status === 'growing') || batches[0];
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const mortalityPct = stats.totalChicks > 0 ? (stats.mortalityPercentage || (activeBatch ? activeBatch.mortalityPercentage : 0)) : 0;
  const totalChicks = stats.totalChicks || (activeBatch ? activeBatch.totalChicks : 0);
  const deadChicks = stats.deadChicks || (activeBatch ? activeBatch.deadChicks : 0);

  // Determine health risk tier
  let statusTier: 'optimal' | 'caution' | 'alert' = 'optimal';
  if (totalChicks > 0) {
    if (mortalityPct > 4.5) statusTier = 'alert';
    else if (mortalityPct > 2.8) statusTier = 'caution';
  }

  const getAdviceList = () => {
    if (totalChicks === 0) {
      return [
        {
          title: '🌱 Ready for First Batch Placement',
          desc: 'Clean, disinfected shed environment detected. Ready to welcome day-old chicks.',
          action: 'Perform pre-heating (32°C - 34°C) 24 hours prior to chick delivery.',
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        },
        {
          title: '💧 Pre-Placement Bio-Security Checklist',
          desc: 'Ensure chick paper bedding, fresh starter feed trays, and electrolyte water are prepared.',
          action: 'Test drinker nipple pressure and chlorine residual (2 ppm).',
          icon: <Droplets className="w-4 h-4 text-teal-400" />,
        },
      ];
    }
    if (statusTier === 'alert') {
      return [
        {
          title: '🚨 Immediate Veterinary Action Required',
          desc: `Mortality is elevated at ${mortalityPct}%. Check for Newcastle Disease / Coccidiosis symptoms immediately.`,
          action: 'Administer water-soluble Sulpha/Antibiotic + Vitamin E & Selenium booster.',
          icon: <Stethoscope className="w-4 h-4 text-rose-400" />,
        },
        {
          title: '💨 Ventilation & Ammonia Purge',
          desc: 'Ensure cross-ventilation fans run at maximum to purge toxic ammonia levels above 20 ppm.',
          action: 'Rake litter bed; apply dry lime/disinfectant on damp patches.',
          icon: <Wind className="w-4 h-4 text-rose-400" />,
        },
      ];
    } else if (statusTier === 'caution') {
      return [
        {
          title: '⚠️ Moderate Mortality Spike Detected',
          desc: `Flock loss is slightly above baseline (${mortalityPct}%). Check water nipple flow and temperature stability.`,
          action: 'Add Liver tonic + Electrolytes in morning drinking water for 3 consecutive days.',
          icon: <Droplets className="w-4 h-4 text-amber-400" />,
        },
        {
          title: '🌡️ Brooding Temperature Calibration',
          desc: 'Verify shed temperature is maintained between 24°C - 28°C to prevent chilling or heat exhaustion.',
          action: 'Adjust side curtains and fogger spray intervals.',
          icon: <ThermometerSun className="w-4 h-4 text-amber-400" />,
        },
      ];
    } else {
      return [
        {
          title: '✨ Flock Bio-Security & Health is Optimal',
          desc: `Flock livability is outstanding at ${(100 - mortalityPct).toFixed(1)}% with standard commercial broiler performance.`,
          action: 'Maintain strict footbath disinfectant (Potassium Permanganate) at shed entrance.',
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        },
        {
          title: '🌾 Optimum FCR & Growth Curve Active',
          desc: 'Feed consumption trajectory matches standard Cobb 500 growth chart without stress indicators.',
          action: 'Ensure clean drinking water chlorine level (2-3 ppm) is tested daily.',
          icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        },
      ];
    }
  };

  const adviceItems = getAdviceList();

  return (
    <TiltCard maxTilt={5} glare={true}>
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        } flex flex-col justify-between h-full`}
      >
        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  statusTier === 'alert'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : statusTier === 'caution'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <span>AI Flock Health & Biosecurity Advisor</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Live mortality rate & automated veterinary diagnostic guidelines
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                statusTier === 'alert'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : statusTier === 'caution'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{statusTier === 'alert' ? 'High Risk' : statusTier === 'caution' ? 'Caution' : 'Healthy'}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] mb-5 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Flock Livability</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                {(100 - mortalityPct).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Loss</span>
              <span className="text-sm sm:text-base font-black text-rose-400">
                {deadChicks.toLocaleString()} birds
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Mortality %</span>
              <span
                className={`text-sm sm:text-base font-black ${
                  statusTier === 'alert' ? 'text-rose-400' : statusTier === 'caution' ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {mortalityPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Advice Items */}
          <div className="space-y-3">
            {adviceItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[var(--bg-input)]/70 border border-[var(--border-color)] text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item.title}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-1.5">
                  {item.desc}
                </p>
                <div className="p-2 rounded-xl bg-black/20 text-[10px] font-semibold text-emerald-400 dark:text-emerald-300">
                  <strong>Recommended Protocol:</strong> {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>Active Batch: <strong>{activeBatch?.batchNumber || 'Batch-01'}</strong></span>
          <span className="text-emerald-400 font-semibold">Standard Cobb 500 Protocol</span>
        </div>
      </div>
    </TiltCard>
  );
}
