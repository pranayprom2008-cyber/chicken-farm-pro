'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, HeartPulse, Stethoscope, Sparkles, Droplets, ThermometerSun, Wind } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';
import TiltCard from '@/components/TiltCard';

export default function FlockHealthAdvisor() {
  const { stats, batches, theme } = useFarmStore();
  const safeBatches = batches || [];
  const activeBatch = safeBatches.find((b) => b?.status === 'growing') || safeBatches[0];
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  const totalChicks = stats?.totalChicks || (activeBatch ? activeBatch.totalChicks : 0) || 0;
  const deadChicks = stats?.deadChicks || (activeBatch ? activeBatch.deadChicks : 0) || 0;
  const mortalityPct = totalChicks > 0 ? (stats?.mortalityPercentage || (activeBatch ? activeBatch.mortalityPercentage : 0) || 0) : 0;

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
          desc: `Mortality is elevated at ${mortalityPct.toFixed(1)}%. Check for Newcastle Disease / Coccidiosis symptoms immediately.`,
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
          desc: `Cumulative loss reached ${mortalityPct.toFixed(1)}%. Inspect bird droppings for blood or discoloration.`,
          action: 'Flush drinker lines with 5 ppm chlorine and provide probiotic supplement.',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        },
        {
          title: '🌡️ Brooding Temperature Check',
          desc: 'Ensure shed temperature matches growth day standard (Day 1: 33°C, Day 14: 28°C, Day 28: 22°C).',
          action: 'Inspect curtain openings and prevent cold draft drafts near chick rings.',
          icon: <ThermometerSun className="w-4 h-4 text-amber-400" />,
        },
      ];
    } else {
      return [
        {
          title: '✅ Optimal Flock Livability',
          desc: `Livability is ${(100 - mortalityPct).toFixed(1)}% across ${totalChicks.toLocaleString()} birds, well within safety thresholds.`,
          action: 'Maintain standard Cobb 500 lighting schedule (20h light, 4h darkness).',
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        },
        {
          title: '💊 Scheduled Vaccination on Track',
          desc: 'Lasota / Gumboro boostering schedule is aligned with current flock age.',
          action: 'Verify drinking water temperature is below 25°C during vaccine administration.',
          icon: <Sparkles className="w-4 h-4 text-teal-400" />,
        },
      ];
    }
  };

  const adviceList = getAdviceList();

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
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  statusTier === 'alert'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : statusTier === 'caution'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>Flock Health Advisor</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Veterinary triage & bio-security protocol advisor
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                statusTier === 'alert'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : statusTier === 'caution'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {statusTier === 'alert' ? '🔴 High Risk' : statusTier === 'caution' ? '🟡 Watch' : '🟢 Optimal'}
            </span>
          </div>

          {/* Advice cards */}
          <div className="space-y-3">
            {adviceList.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item.title}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-6">
                  {item.desc}
                </p>
                <div className="pl-6 pt-1">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                    Recommended: {item.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Target Livability: 97.5%</span>
          <span className="text-emerald-400 font-bold">
            ● Current: {(100 - mortalityPct).toFixed(1)}%
          </span>
        </div>
      </div>
    </TiltCard>
  );
}
