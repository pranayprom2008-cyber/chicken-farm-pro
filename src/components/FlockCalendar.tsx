'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Syringe, Wheat, Scale, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { useFarmStore, Batch } from '@/store/useFarmStore';
import Modal from '@/components/Modal';

interface Milestone {
  day: number;
  title: string;
  category: 'vaccination' | 'feed' | 'weight' | 'harvest';
  targetWeight: string;
  description: string;
  medication: string;
}

const standardMilestones: Milestone[] = [
  {
    day: 1,
    title: 'Chick Placement & Brooding',
    category: 'vaccination',
    targetWeight: '42 - 45 g',
    description: 'Placement in heated brooding ring (95°F). Check crop fill 8 hours post-placement.',
    medication: "Electrolytes + Glucose + Marek's / ND (Ranikhet) H120",
  },
  {
    day: 7,
    title: 'Lasota Vaccine (1st Dose)',
    category: 'vaccination',
    targetWeight: '180 - 200 g (4.5x birth wt)',
    description: 'Administer Newcastle Disease (Lasota) via eye-drop or drinking water.',
    medication: 'Lasota Strain + Vitamin E & Selenium booster',
  },
  {
    day: 14,
    title: 'IBD (Gumboro) Vaccine',
    category: 'vaccination',
    targetWeight: '450 - 500 g',
    description: 'Administer Infectious Bursal Disease vaccine in milk-mixed skimmed water.',
    medication: 'IBD (Intermediate Plus) Vaccine',
  },
  {
    day: 21,
    title: 'Lasota Booster Vaccine',
    category: 'vaccination',
    targetWeight: '880 - 950 g',
    description: 'Booster dose for Newcastle Disease to build lifetime immune titer.',
    medication: 'Lasota Booster + Liver Tonic / B-Complex',
  },
  {
    day: 28,
    title: 'Feed Switch: Starter → Finisher',
    category: 'feed',
    targetWeight: '1,450 - 1,600 g',
    description: 'Transition from high-protein Starter crumble to dense Broiler Finisher pellets.',
    medication: 'Coccidiosis preventive / Acidifier in water',
  },
  {
    day: 35,
    title: 'Pre-Harvest Flock Assessment',
    category: 'weight',
    targetWeight: '2,000 - 2,250 g',
    description: 'Calculate average weight using sample weighing; contact wholesale poultry traders.',
    medication: 'Withdraw antibiotics (3-5 day withdrawal period)',
  },
  {
    day: 42,
    title: 'Commercial Harvest & Sale',
    category: 'harvest',
    targetWeight: '2,400 - 2,700 g',
    description: 'Night catching & crate loading for minimal bird stress. Weigh live birds at weighbridge.',
    medication: 'Clean water only during feed withdrawal (8-10 hrs)',
  },
];

interface FlockCalendarProps {
  batch?: Batch;
}

export default function FlockCalendar({ batch }: FlockCalendarProps) {
  const { batches, theme } = useFarmStore();
  const activeBatch = batch || batches.find((b) => b.status === 'growing') || batches[0];
  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';

  // Calculate current batch age in days
  const startDate = activeBatch?.startDate ? new Date(activeBatch.startDate) : new Date();
  const today = new Date();
  const diffDays = Math.max(1, Math.min(45, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1));

  // Checklist stored in localStorage
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`flock-checklist-${activeBatch?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [1, 7];
    }
    return [1, 7];
  });

  const toggleDay = (day: number) => {
    const next = completedDays.includes(day)
      ? completedDays.filter((d) => d !== day)
      : [...completedDays, day];
    setCompletedDays(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`flock-checklist-${activeBatch?.id || 'default'}`, JSON.stringify(next));
    }
  };

  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
        isLiquid ? 'liquid-panel' : 'shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              45-Day Poultry Growth & Vaccination Protocol
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Commercial Cobb 500 milestone calendar & veterinary schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <Award className="w-4 h-4" />
          <span>Current Age: Day {diffDays} of 45</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {standardMilestones.map((milestone) => {
          const isDone = completedDays.includes(milestone.day);
          const isCurrent = diffDays >= milestone.day && diffDays < milestone.day + 7;

          return (
            <motion.div
              key={milestone.day}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
              onClick={() => toggleDay(milestone.day)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                isDone
                  ? 'bg-emerald-950/20 dark:bg-emerald-950/40 border-emerald-500/40 opacity-90'
                  : isCurrent
                  ? 'bg-cyan-950/20 dark:bg-cyan-950/40 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                  : 'bg-[var(--bg-input)]/70 border-[var(--border-color)]'
              }`}
            >
              {/* Checkbox button */}
              <button
                type="button"
                className="mt-0.5 text-lg text-emerald-400 focus:outline-none flex-shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <Circle className="w-5 h-5 text-[var(--text-muted)] hover:text-emerald-400" />
                )}
              </button>

              {/* Milestone Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-black/30 border border-white/10 text-[11px] font-black text-[var(--text-primary)]">
                      Day {milestone.day}
                    </span>
                    <span className={`text-xs font-extrabold ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                      {milestone.title}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold animate-pulse">
                        Active Window
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-400">
                    Target: {milestone.targetWeight}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {milestone.description}
                </p>

                <div className="mt-2 p-2 rounded-xl bg-black/25 text-[10px] text-teal-300 flex items-center gap-1.5 font-medium">
                  <Syringe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span><strong>Protocol:</strong> {milestone.medication}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
