"use client";
import React, { useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, PieChart, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const { theme, getDashboardStats, getExpensesByCategory, batches, expenses, revenues } = useFarmStore();
  const [dateRange, setDateRange] = useState('month');
  
  const stats = getDashboardStats();
  const expensesByCategory = getExpensesByCategory();
  const totalExpensesCat = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
  const categories = Object.keys(expensesByCategory);

  const netProfit = stats.totalRevenue - stats.totalExpenditure;
  const avgMortality = batches.length > 0 ? (batches.reduce((sum, b) => sum + (b.mortalityPercentage || 0), 0) / batches.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Analytics & Insights
          </h1>
          <p className="text-[var(--text-secondary)]">Visualize your farm's performance</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-[var(--text-primary)] focus:outline-none text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-500">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><TrendingDown className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-red-500">₹{stats.totalExpenditure.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><DollarSign className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Net Profit</h3>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">₹{netProfit.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Activity className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Avg Mortality</h3>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{avgMortality.toFixed(2)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" /> Expense Distribution
          </h2>
          <div className="space-y-4">
            {categories.map((cat, idx) => {
              const amount = expensesByCategory[cat];
              const percent = totalExpensesCat > 0 ? (amount / totalExpensesCat) * 100 : 0;
              const color = colors[idx % colors.length];
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-primary)] capitalize">{cat}</span>
                    <span className="text-[var(--text-secondary)]">₹{amount.toLocaleString()} ({percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="text-[var(--text-muted)] text-center py-4">No expense data available.</p>
            )}
          </div>
        </div>

        <div className={`p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Batch Performance
          </h2>
          <div className="space-y-5">
            {batches.slice(0, 5).map(batch => (
              <div key={batch.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[var(--text-primary)]">{batch.name}</span>
                  <span className="text-[var(--text-secondary)]">{batch.mortalityPercentage?.toFixed(1) || 0}% Mortality</span>
                </div>
                <div className="w-full h-3 flex rounded-full overflow-hidden bg-[var(--bg-primary)]">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    title={`Alive: ${batch.chicksAlive}`}
                    style={{ width: `${(batch.chicksAlive / batch.totalChicks) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-red-500 transition-all duration-500" 
                    title={`Dead: ${batch.totalChicks - batch.chicksAlive}`}
                    style={{ width: `${((batch.totalChicks - batch.chicksAlive) / batch.totalChicks) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>Alive: {batch.chicksAlive}</span>
                  <span>Total: {batch.totalChicks}</span>
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <p className="text-[var(--text-muted)] text-center py-4">No batches available.</p>
            )}
          </div>
        </div>

        <div className={`col-span-1 lg:col-span-2 p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
           <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Revenue vs Expenses Overview
          </h2>
          <div className="flex flex-col gap-6">
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-primary)]">Total Revenue</span>
                  <span className="text-emerald-500 font-medium">₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${Math.max(5, (stats.totalRevenue / (stats.totalRevenue + stats.totalExpenditure || 1)) * 100)}%` }}
                  ></div>
                </div>
             </div>
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-primary)]">Total Expenses</span>
                  <span className="text-red-500 font-medium">₹{stats.totalExpenditure.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500" 
                    style={{ width: `${Math.max(5, (stats.totalExpenditure / (stats.totalRevenue + stats.totalExpenditure || 1)) * 100)}%` }}
                  ></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
