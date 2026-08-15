"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useFarmStore } from '@/store/useFarmStore';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'violet' | 'cyan';
}

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'emerald'
}: StatsCardProps) {
  const theme = useFarmStore((state) => state.theme);
  const isObsidian = theme === 'obsidian';
  
  const colors = colorMap[color];

  return (
    <div className={`p-6 rounded-2xl w-full transition-all duration-300 ${
      isObsidian 
        ? 'obsidian-glass hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)] group' 
        : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:shadow-lg'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <h3 className={`text-2xl font-bold font-[var(--font-heading)] ${isObsidian ? 'obsidian-gradient-text' : 'text-[var(--text-primary)]'}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} ${isObsidian ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' :
            trend === 'down' ? 'text-red-500 bg-red-500/10' :
            'text-gray-500 bg-gray-500/10'
          }`}>
            {trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" />}
            {trendValue}
          </div>
          <span className="text-xs text-[var(--text-muted)]">vs last month</span>
        </div>
      )}
    </div>
  );
}
