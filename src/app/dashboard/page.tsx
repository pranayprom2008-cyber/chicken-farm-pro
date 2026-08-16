'use client';

import React, { useEffect, useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { motion } from 'framer-motion';
import {
  Layers,
  Activity,
  Bird,
  Skull,
  Percent,
  Wheat,
  Scale,
  Pill,
  Zap,
  Users,
  Wrench,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

import Floating3DChicken from '@/components/Floating3DChicken';
import WhatsAppReportModal from '@/components/WhatsAppReportModal';
import FlockHealthAdvisor from '@/components/FlockHealthAdvisor';
import FeedForecastWidget from '@/components/FeedForecastWidget';
import { Send } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.025,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 26,
    },
  },
};

export default function DashboardPage() {
  const {
    stats,
    batches,
    theme,
    settings,
    loading,
    error,
    fetchDashboardData,
    fetchBatches,
  } = useFarmStore();

  const [mounted, setMounted] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
    fetchBatches();
  }, [fetchDashboardData, fetchBatches]);

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';
  const currency = settings?.currency || '₹';

  const formatMoney = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN')}`;
  };

  const statCards = [
    {
      id: 'totalBatches',
      title: 'Total Batches',
      value: stats?.totalBatches ?? 0,
      sub: `${stats?.activeBatches ?? 0} active • ${stats?.completedBatches ?? 0} closed`,
      icon: Layers,
      color: 'emerald',
    },
    {
      id: 'activeBatches',
      title: 'Active Batches',
      value: stats?.activeBatches ?? 0,
      sub: 'Currently in grow-out cycle',
      icon: Activity,
      color: 'blue',
    },
    {
      id: 'totalChicks',
      title: 'Total Chicks Stocked',
      value: (stats?.totalChicks ?? 0).toLocaleString(),
      sub: 'Across all active/past flocks',
      icon: Bird,
      color: 'cyan',
    },
    {
      id: 'aliveChicks',
      title: 'Alive Chicks',
      value: (stats?.aliveChicks ?? 0).toLocaleString(),
      sub: 'Healthy birds on farm',
      icon: Bird,
      color: 'emerald',
    },
    {
      id: 'deadChicks',
      title: 'Dead Chicks (Mortality)',
      value: (stats?.deadChicks ?? 0).toLocaleString(),
      sub: 'Cumulative mortality',
      icon: Skull,
      color: 'rose',
    },
    {
      id: 'mortalityPercentage',
      title: 'Mortality Percentage',
      value: `${(stats?.mortalityPercentage ?? 0).toFixed(2)}%`,
      sub: (stats?.mortalityPercentage ?? 0) <= 4 ? 'Optimal (< 4%)' : 'Needs Attention',
      icon: Percent,
      color: (stats?.mortalityPercentage ?? 0) <= 4 ? 'emerald' : 'amber',
    },
    {
      id: 'feedConsumed',
      title: 'Feed Consumed',
      value: `${(stats?.feedConsumed ?? 0).toLocaleString()} kg`,
      sub: `${Math.round((stats?.feedConsumed ?? 0) / 50)} bags used`,
      icon: Wheat,
      color: 'amber',
    },
    {
      id: 'medicineCost',
      title: 'Medicine Cost',
      value: formatMoney(stats?.medicineCost ?? 0),
      sub: 'Vaccines & Boosters',
      icon: Pill,
      color: 'violet',
    },
    {
      id: 'electricityCost',
      title: 'Electricity Cost',
      value: formatMoney(stats?.electricityCost ?? 0),
      sub: `${stats?.electricityUnits ?? 0} Units consumed`,
      icon: Zap,
      color: 'amber',
    },
    {
      id: 'labourCost',
      title: 'Labour Cost',
      value: formatMoney(stats?.labourCost ?? 0),
      sub: 'Staff & Wages',
      icon: Users,
      color: 'cyan',
    },
    {
      id: 'maintenanceCost',
      title: 'Maintenance Cost',
      value: formatMoney(stats?.maintenanceCost ?? 0),
      sub: 'Equipment upkeep',
      icon: Wrench,
      color: 'rose',
    },
    {
      id: 'totalExpenditure',
      title: 'Total Expenditure',
      value: formatMoney(stats?.totalExpenditure ?? 0),
      sub: 'All operating costs combined',
      icon: TrendingDown,
      color: 'rose',
      highlight: true,
    },
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      value: formatMoney(stats?.totalRevenue ?? 0),
      sub: `${(stats?.totalChickensSold ?? 0).toLocaleString()} birds sold`,
      icon: TrendingUp,
      color: 'emerald',
      highlight: true,
    },
    {
      id: 'estimatedProfit',
      title: 'Estimated Profit',
      value: formatMoney(stats?.estimatedProfit ?? 0),
      sub: 'Net revenue - costs',
      icon: DollarSign,
      color: (stats?.estimatedProfit ?? 0) >= 0 ? 'emerald' : 'rose',
      highlight: true,
    },
  ];

  const pieData = [
    { name: 'Feed', value: stats?.categoryExpenses.feed || 1, color: '#F59E0B' },
    { name: 'Medicine', value: stats?.categoryExpenses.medicine || 0, color: '#8B5CF6' },
    { name: 'Electricity', value: stats?.categoryExpenses.electricity || 0, color: '#06B6D4' },
    { name: 'Labour', value: stats?.categoryExpenses.labour || 0, color: '#10B981' },
    { name: 'Maintenance', value: stats?.categoryExpenses.maintenance || 0, color: '#EC4899' },
  ].filter((d) => d.value > 0);

  const monthlyData = stats?.monthlyChartData && stats.monthlyChartData.length > 0
    ? stats.monthlyChartData
    : [
        { month: 'Oct', expense: 420000, revenue: 680000, profit: 260000 },
        { month: 'Nov', expense: 490000, revenue: 750000, profit: 260000 },
        { month: 'Dec', expense: 530000, revenue: 890000, profit: 360000 },
        { month: 'Jan', expense: 610000, revenue: 990000, profit: 380000 },
        { month: 'Feb', expense: 680000, revenue: 1114182, profit: 434182 },
      ];

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Welcome & Live Refresh Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Floating3DChicken size={54} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Farm Dashboard
              </h1>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Real-time biometric data & financial telemetry • 3D Interactive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Dispatch 1-Click WhatsApp Daily Briefing to John and Pranay"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp Dispatch</span>
            <span className="sm:hidden">Brief</span>
          </button>

          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className={`p-2.5 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] transition-all cursor-pointer ${
              loading ? 'animate-spin' : 'hover:scale-105'
            }`}
            title="Refresh database data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard/billing"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md ${
              isLiquid
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Billing Calc</span>
          </Link>

          <Link
            href="/dashboard/batches"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white transition-all shadow-md ${
              isLiquid
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-violet-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Batch</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-sm">
          <span>Error loading database records: {error}</span>
          <button
            onClick={() => fetchDashboardData()}
            className="px-3 py-1 bg-red-500 text-white rounded-xl text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 15 Dashboard Cards Grid with Staggered Framer Motion */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.015 }}
              className={`p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-all duration-300 flex flex-col justify-between group cursor-default ${
                isLiquid ? 'liquid-panel' : 'shadow-sm hover:shadow-md'
              } ${card.highlight ? 'ring-1 ring-emerald-500/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider line-clamp-1">
                  {card.title}
                </span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    card.color === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : card.color === 'blue'
                      ? 'bg-blue-500/10 text-blue-500'
                      : card.color === 'cyan'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : card.color === 'amber'
                      ? 'bg-amber-500/10 text-amber-500'
                      : card.color === 'violet'
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {card.value}
                </div>
                <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 font-medium truncate">
                  {card.sub}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI Health Diagnostic & Feed Depletion Forecast Productivity Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <FlockHealthAdvisor />
        <FeedForecastWidget />
      </div>

      {/* Analytics & Financial Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Revenue vs Expenditure Trend */}
        <div className="lg:col-span-8">
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] h-full flex flex-col justify-between ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Revenue vs Operating Expenditure
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Monthly financial performance and net farm margin
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expenses
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`₹ ${Number(val).toLocaleString('en-IN')}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="lg:col-span-4">
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] h-full flex flex-col justify-between ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Expense Distribution
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Cost allocation across farm operations
              </p>
            </div>

            <div className="h-48 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                    formatter={(v: any) => [`₹ ${Number(v).toLocaleString('en-IN')}`, 'Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
              {pieData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--text-secondary)]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    ₹ {item.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Batches Section */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Active Batches Overview
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live grow-out countdown, flock mortality, and cost per chick tracking
            </p>
          </div>
          <Link
            href="/dashboard/batches"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            <Bird className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm">No batches in database yet.</p>
            <Link
              href="/dashboard/batches"
              className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
            >
              + Create First Batch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] flex flex-col justify-between transition-all ${
                  isLiquid ? 'hover:border-cyan-500/40' : 'hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">
                      {batch.batchNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        batch.status === 'growing'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-3">
                    {batch.batchName || batch.breedType}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Chicks Alive:</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {batch.aliveChicks.toLocaleString()} / {batch.totalChicks.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Mortality:</span>
                    <span
                      className={`font-bold ${
                        batch.mortalityPercentage > 4 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {batch.mortalityPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Cost / Chick:</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      ₹ {batch.costPerChick.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Executive Summary Dispatch Modal */}
      <WhatsAppReportModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </div>
  );
}
