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
  ChevronRight,
  Send,
  Receipt,
  Bot
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
import TiltCard from '@/components/TiltCard';
import WhatsAppReportModal from '@/components/WhatsAppReportModal';
import FlockHealthAdvisor from '@/components/FlockHealthAdvisor';
import FeedForecastWidget from '@/components/FeedForecastWidget';
import TodayFarmBrief from '@/components/TodayFarmBrief';
import AIFarmInsights from '@/components/AIFarmInsights';
import AIProfitPrediction from '@/components/AIProfitPrediction';
import FarmAIScoreWidget from '@/components/FarmAIScoreWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function DashboardPage() {
  const {
    stats,
    batches,
    user,
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

  const currency = settings?.currency || '₹';

  const formatMoney = (val: number) => {
    return `${currency} ${val.toLocaleString('en-IN')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name ? user.name.toUpperCase() : 'FARM OPERATOR';
    if (hour < 12) return `GOOD MORNING, ${name}`;
    if (hour < 17) return `GOOD AFTERNOON, ${name}`;
    return `GOOD EVENING, ${name}`;
  };

  // Top 4 Primary Spatial Cards
  const coreStats = [
    {
      id: 'activeBatches',
      title: 'Active Batches',
      value: stats?.activeBatches ?? 0,
      sub: `${stats?.totalBatches ?? 0} total • ${stats?.completedBatches ?? 0} closed`,
      icon: Activity,
      color: 'emerald',
      href: '/dashboard/batches',
    },
    {
      id: 'totalExpenditure',
      title: 'Total Expenses',
      value: formatMoney(stats?.totalExpenditure ?? 0),
      sub: `Feed: ${formatMoney(stats?.categoryExpenses?.feed ?? 0)}`,
      icon: TrendingDown,
      color: 'rose',
      href: '/dashboard/expenses',
    },
    {
      id: 'aliveChicks',
      title: 'Alive Birds',
      value: (stats?.aliveChicks ?? 0).toLocaleString(),
      sub: `${(stats?.mortalityPercentage ?? 0).toFixed(2)}% Cumulative Mortality`,
      icon: Bird,
      color: 'cyan',
      href: '/dashboard/batches',
    },
    {
      id: 'estimatedProfit',
      title: 'Estimated Profit',
      value: formatMoney(stats?.estimatedProfit ?? 0),
      sub: `Gross Revenue: ${formatMoney(stats?.totalRevenue ?? 0)}`,
      icon: DollarSign,
      color: (stats?.estimatedProfit ?? 0) >= 0 ? 'emerald' : 'amber',
      href: '/dashboard/revenue',
    },
  ];

  // Secondary Biometric Cards
  const secondaryStats = [
    {
      id: 'totalChicks',
      title: 'Total Chicks Stocked',
      value: (stats?.totalChicks ?? 0).toLocaleString(),
      sub: 'All placed flocks',
      icon: Layers,
    },
    {
      id: 'deadChicks',
      title: 'Dead Chicks (Mortality)',
      value: (stats?.deadChicks ?? 0).toLocaleString(),
      sub: `${stats?.mortalityPercentage ?? 0}% rate`,
      icon: Skull,
    },
    {
      id: 'feedConsumed',
      title: 'Feed Consumed',
      value: `${(stats?.feedConsumed ?? 0).toLocaleString()} kg`,
      sub: `~${Math.round((stats?.feedConsumed ?? 0) / 50)} bags used`,
      icon: Wheat,
    },
    {
      id: 'medicineCost',
      title: 'Medicine Cost',
      value: formatMoney(stats?.medicineCost ?? 0),
      sub: 'Vaccines & Boosters',
      icon: Pill,
    },
    {
      id: 'electricityCost',
      title: 'Electricity Cost',
      value: formatMoney(stats?.electricityCost ?? 0),
      sub: `${stats?.electricityUnits ?? 0} Units consumed`,
      icon: Zap,
    },
    {
      id: 'labourCost',
      title: 'Labour Cost',
      value: formatMoney(stats?.labourCost ?? 0),
      sub: 'Staff & Wages',
      icon: Users,
    },
  ];

  // Floating Quick Actions
  const quickActions = [
    { label: '+ Add Batch', href: '/dashboard/batches', icon: Plus },
    { label: '💰 Add Expense', href: '/dashboard/expenses', icon: DollarSign },
    { label: '🐔 Record Mortality', href: '/dashboard/batches', icon: Skull },
    { label: '🌽 Add Feed', href: '/dashboard/expenses', icon: Wheat },
    { label: '🧾 Create Bill', href: '/dashboard/billing', icon: Receipt },
    { label: '✨ Ask ChickAI', href: '#', icon: Bot, isChickAI: true },
  ];

  const pieData = [
    { name: 'Feed', value: stats?.categoryExpenses.feed || 1, color: '#10B981' },
    { name: 'Medicine', value: stats?.categoryExpenses.medicine || 0, color: '#8B5CF6' },
    { name: 'Electricity', value: stats?.categoryExpenses.electricity || 0, color: '#06B6D4' },
    { name: 'Labour', value: stats?.categoryExpenses.labour || 0, color: '#F59E0B' },
    { name: 'Maintenance', value: stats?.categoryExpenses.maintenance || 0, color: '#EC4899' },
  ].filter((d) => d.value > 0);

  const monthlyData = stats?.monthlyChartData && stats.monthlyChartData.length > 0
    ? stats.monthlyChartData
    : [
        { month: 'Oct', expense: 0, revenue: 0, profit: 0 },
        { month: 'Nov', expense: 0, revenue: 0, profit: 0 },
        { month: 'Dec', expense: 0, revenue: 0, profit: 0 },
        { month: 'Jan', expense: 0, revenue: 0, profit: 0 },
        { month: 'Feb', expense: 0, revenue: 0, profit: 0 },
      ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Spatial Header & Operational Greeting ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              {getGreeting()}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mt-0.5">
            Farm Overview
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Real-time biometric data & financial telemetry • Spatial Glass OS
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="spatial-btn-primary cursor-pointer text-xs"
            title="Dispatch 1-Click WhatsApp Daily Briefing"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp Dispatch</span>
          </button>

          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer hover:scale-105"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/dashboard/batches"
            className="spatial-btn-secondary text-xs font-bold"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Batch</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-xs">
          <span>Connection notice: {error}</span>
          <button
            onClick={() => fetchDashboardData()}
            className="px-3 py-1 bg-red-500 text-white rounded-xl font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 4 Core Spatial Glass Metric Cards with 3D Parallax Tilt ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {coreStats.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.id} href={c.href}>
              <TiltCard maxTilt={4} glare={true}>
                <div className="spatial-card p-5 sm:p-6 flex flex-col justify-between h-36 sm:h-40 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {c.title}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 transition-transform group-hover:scale-110">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                      {c.value}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
                      <span className="truncate">{c.sub}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Link>
          );
        })}
      </div>

      {/* ── Floating Spatial Quick Actions Bar ── */}
      <div className="spatial-glass p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2 px-1 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Spatial Quick Operations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickActions.map((act, i) => {
            const Icon = act.icon;
            return (
              <Link
                key={i}
                href={act.href}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-[var(--text-primary)] hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{act.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 🧠 AI Farm Intelligence Spatial Command Center ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              🧠 AI Farm Intelligence Command Center
            </h2>
          </div>
          <span className="text-[11px] font-mono text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
            Real-Time Biometric Analysis Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          <FarmAIScoreWidget />
          <TodayFarmBrief />
          <AIFarmInsights />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          <AIProfitPrediction />
          <FlockHealthAdvisor />
          <FeedForecastWidget />
        </div>
      </div>

      {/* ── Secondary Biometric & Utility Metrics ── */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block px-1">
          Biometric & Utility Breakdown
        </span>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5"
        >
          {secondaryStats.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={itemVariants}
                className="spatial-glass p-3.5 flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase truncate">
                    {card.title}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">
                    {card.sub}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Spatial Financial & Cost Visualizations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Revenue vs Operating Expenses Area Chart */}
        <div className="lg:col-span-8">
          <div className="spatial-glass p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Revenue vs Operating Expenditure
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Monthly financial performance and net margin curves
                </p>
              </div>
              <div className="flex items-center gap-3.5 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Expenses
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 18, 14, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(20px)',
                    }}
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
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost Category Breakdown Pie Chart */}
        <div className="lg:col-span-4">
          <div className="spatial-glass p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Cost Category Distribution
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Proportional operating expense allocations
              </p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 18, 14, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      backdropFilter: 'blur(20px)',
                    }}
                    formatter={(v: any) => formatMoney(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total</span>
                <span className="text-xs font-black text-white">
                  {formatMoney(stats?.totalExpenditure || 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[var(--text-muted)] text-[11px] truncate">{d.name}:</span>
                  <span className="font-bold text-[11px]">{formatMoney(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppReportModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </div>
  );
}
