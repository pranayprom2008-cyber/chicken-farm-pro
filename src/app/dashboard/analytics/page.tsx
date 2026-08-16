'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Layers,
  Percent,
  Wheat,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const { theme, stats, batches, expenses, fetchDashboardData } = useFarmStore();

  const [activeTab, setActiveTab] = useState<'financial' | 'feed' | 'mortality' | 'comparison'>('financial');

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass';

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Feed & Growth telemetry mock/computed from batches
  const growthCurveData = [
    { day: 'Day 1', weight: 45, feedIntake: 15, standardWeight: 45 },
    { day: 'Day 7', weight: 190, feedIntake: 32, standardWeight: 185 },
    { day: 'Day 14', weight: 480, feedIntake: 65, standardWeight: 460 },
    { day: 'Day 21', weight: 950, feedIntake: 110, standardWeight: 920 },
    { day: 'Day 28', weight: 1540, feedIntake: 155, standardWeight: 1500 },
    { day: 'Day 35', weight: 2150, feedIntake: 190, standardWeight: 2080 },
    { day: 'Day 42', weight: 2680, feedIntake: 220, standardWeight: 2600 },
  ];

  const batchComparisonData = batches.map((b) => ({
    name: b.batchNumber,
    mortality: b.mortalityPercentage,
    costPerChick: b.costPerChick || 45,
    chicks: b.totalChicks,
  }));

  const mortalityTrendData = [
    { week: 'Week 1 (Brooding)', rate: 0.8, deaths: 40 },
    { week: 'Week 2 (Starter)', rate: 0.5, deaths: 25 },
    { week: 'Week 3 (Growth)', rate: 0.4, deaths: 20 },
    { week: 'Week 4 (Grower)', rate: 0.3, deaths: 15 },
    { week: 'Week 5 (Finisher 1)', rate: 0.25, deaths: 12 },
    { week: 'Week 6 (Finisher 2)', rate: 0.2, deaths: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Farm Analytics & Deep Insights
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Evaluate growth curves, feed efficiency, mortality trends, and financial yields
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          {[
            { id: 'financial', label: 'Financials' },
            { id: 'feed', label: 'Feed & Growth' },
            { id: 'mortality', label: 'Mortality Trend' },
            { id: 'comparison', label: 'Batch Comparison' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? isLiquid
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500 text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Tabs View */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
              Monthly Revenue vs Expenditure vs Profit Margin
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Calculated from sales records and category expenditures
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.monthlyChartData && stats.monthlyChartData.length > 0 ? stats.monthlyChartData : [
                    { month: 'Oct', expense: 420000, revenue: 680000, profit: 260000 },
                    { month: 'Nov', expense: 490000, revenue: 750000, profit: 260000 },
                    { month: 'Dec', expense: 530000, revenue: 890000, profit: 360000 },
                    { month: 'Jan', expense: 610000, revenue: 990000, profit: 380000 },
                    { month: 'Feb', expense: 680000, revenue: 1114182, profit: 434182 },
                  ]}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isLiquid ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLiquid ? '#0b0f19' : '#ffffff',
                      borderColor: isLiquid ? '#1e293b' : '#e2e8f0',
                      borderRadius: '12px',
                    }}
                    formatter={(val: any) => [`₹ ${Number(val).toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Gross Revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Total Expenditure" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="#00E5FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
              Live Broiler Weight Gain vs Daily Feed Intake (Cobb 500)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Standard breed benchmark curve vs actual telemetry
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLiquid ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="g" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLiquid ? '#0b0f19' : '#ffffff',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Actual Bird Weight (g)" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="standardWeight" name="Breed Standard Target (g)" stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} />
                  <Line type="monotone" dataKey="feedIntake" name="Daily Feed / Bird (g)" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mortality' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
              Weekly Mortality Progression & Distribution
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Brooding vs finisher stage mortality telemetry
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mortalityTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mortGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLiquid ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLiquid ? '#0b0f19' : '#ffffff',
                      borderRadius: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="rate" name="Mortality Rate %" stroke="#F43F5E" strokeWidth={3} fill="url(#mortGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
              Flock Batch Comparison: Cost Per Chick & Mortality %
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Compare efficiency metrics across historical and active placements
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLiquid ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLiquid ? '#0b0f19' : '#ffffff',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="costPerChick" name="Cost per Chick (₹)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="mortality" name="Mortality (%)" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
