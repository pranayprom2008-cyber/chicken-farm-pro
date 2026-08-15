"use client";

import { useFarmStore } from '@/store/useFarmStore';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { theme, getDashboardStats, settings } = useFarmStore();
  const stats = getDashboardStats();
  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm p-6 ${theme === 'obsidian' ? 'obsidian-glass' : ''}`;

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  // Mock data for charts
  const expenseCategories = [
    { name: 'Feed', percentage: 65, color: 'bg-emerald-500' },
    { name: 'Medicine', percentage: 15, color: 'bg-blue-500' },
    { name: 'Labour', percentage: 10, color: 'bg-violet-500' },
    { name: 'Electricity', percentage: 7, color: 'bg-amber-500' },
    { name: 'Other', percentage: 3, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-xl">
          <BarChart3 size={24} />
        </div>
        <h1 className="text-2xl font-bold">Farm Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit/Loss Summary */}
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-6">Financial Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Total Revenue</span>
              <span className="font-bold text-emerald-500">{formatCurrency(stats.expectedRevenue)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Total Expenditure</span>
              <span className="font-bold text-red-500">{formatCurrency(stats.totalExpenditure)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-900/50">
              <span className="font-medium">Net Profit/Loss</span>
              <span className={`font-bold text-xl ${stats.estimatedProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(stats.estimatedProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown (CSS Bar Chart) */}
        <div className={cardClass}>
          <h2 className="text-lg font-bold mb-6">Expense Breakdown</h2>
          <div className="space-y-4">
            {expenseCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat.name}</span>
                  <span className="font-medium">{cat.percentage}%</span>
                </div>
                <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cat.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mortality Overview */}
        <div className={`${cardClass} lg:col-span-2`}>
          <h2 className="text-lg font-bold mb-6">Mortality Overview Across Batches</h2>
          <div className="flex items-end gap-2 h-48 mt-8">
            {[2, 5, 3, 8, 1, 4, 2].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-red-500/20 hover:bg-red-500/80 rounded-t-lg transition-all relative flex items-end justify-center">
                  <div 
                    className="w-full bg-red-500 rounded-t-lg transition-all duration-500 group-hover:bg-red-400"
                    style={{ height: `${val * 10}px`, minHeight: '4px' }}
                  ></div>
                  <span className="absolute -top-6 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}%
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] truncate w-full text-center">B-{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
