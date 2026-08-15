"use client";

import { useFarmStore } from '@/store/useFarmStore';
import StatsCard from '@/components/StatsCard';
import { Bird, TrendingUp, DollarSign, Skull, Plus, Activity, BarChart3, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, settings, theme, getDashboardStats } = useFarmStore();
  const stats = getDashboardStats();

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm p-6 transition-all duration-200 hover:shadow-md ${theme === 'obsidian' ? 'obsidian-glass' : ''}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Farmer'}!</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Here&apos;s what&apos;s happening on your farm today.</p>
        </div>
        <Link href="/dashboard/batches" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-white shadow-sm ${
          theme === 'obsidian' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-violet-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
        }`}>
          <Plus size={18} />
          <span>New Batch</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Batches" value={stats.totalBatches} icon={Activity} color="blue" />
        <StatsCard title="Active Batches" value={stats.activeBatches} icon={TrendingUp} color="emerald" />
        <StatsCard title="Alive Chicks" value={stats.aliveChicks.toLocaleString()} icon={Bird} color="amber" />
        <StatsCard title="Mortality Rate" value={`${stats.mortalityPercentage.toFixed(1)}%`} icon={Skull} color="red" />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cardClass}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Total Expenditure</h3>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalExpenditure)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Across all categories</p>
        </div>
        <div className={cardClass}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Expected Revenue</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.expectedRevenue)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Sales + projected</p>
        </div>
        <div className={cardClass}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Estimated Profit</h3>
            <div className={`p-2 rounded-lg ${stats.estimatedProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              <DollarSign size={18} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${stats.estimatedProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(stats.estimatedProfit)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Revenue - Expenses</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cardClass}>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/batches" className="flex items-center gap-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 rounded-xl transition-all duration-200 text-sm">
            <Bird size={16} className="text-emerald-500" />
            <span>Manage Batches</span>
          </Link>
          <Link href="/dashboard/expenses" className="flex items-center gap-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 rounded-xl transition-all duration-200 text-sm">
            <Wallet size={16} className="text-red-500" />
            <span>Record Expense</span>
          </Link>
          <Link href="/dashboard/revenue" className="flex items-center gap-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 rounded-xl transition-all duration-200 text-sm">
            <DollarSign size={16} className="text-emerald-500" />
            <span>Add Revenue</span>
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 rounded-xl transition-all duration-200 text-sm">
            <BarChart3 size={16} className="text-blue-500" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
