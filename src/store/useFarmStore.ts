'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'liquid' | 'obsidian' | 'liquid-glass';

export const ALLOWED_PHONES = ['9502828293', '9849852085'];

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  avatar?: string;
}

export interface Batch {
  id: string;
  batchNumber: string;
  batchName: string;
  breedType: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string | null;
  durationDays: number;
  totalChicks: number;
  aliveChicks: number;
  deadChicks: number;
  mortalityPercentage: number;
  daysRemaining: number;
  daysElapsed: number;
  growthProgress: number;
  status: 'growing' | 'completed' | 'sold';
  notes?: string | null;
  totalExpenditure: number;
  costPerChick: number;
  totalRevenue: number;
  totalChickensSold: number;
  netProfit: number;
  profitPerChick: number;
  costBreakdown?: {
    feed: number;
    medicine: number;
    labour: number;
    electricity: number;
    maintenance: number;
    other: number;
  };
  dailyRecords?: DailyRecord[];
  createdAt: string;
}

export interface DailyRecord {
  id: string;
  batchId: string;
  date: string;
  aliveChicks: number;
  deadChicks: number;
  feedConsumed: number;
  averageWeight: number;
  notes?: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  batchId?: string | null;
  batch?: Batch | null;
  createdAt: string;
}

export interface BillingRecord {
  id: string;
  type: string;
  chickRate?: number | null;
  numberOfChicks?: number | null;
  feedBags?: number | null;
  fcrScore?: number | null;
  totalAmount: number;
  notes?: string | null;
  batchId?: string | null;
  batch?: Batch | null;
  date: string;
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  batchId?: string | null;
  batch?: Batch | null;
  chickensSold: number;
  averageWeight: number;
  pricePerKg: number;
  totalRevenue: number;
  buyer?: string | null;
  notes?: string | null;
  saleDate: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalChicks: number;
  aliveChicks: number;
  deadChicks: number;
  mortalityPercentage: number;
  feedConsumed: number;
  feedRemaining: number;
  medicineCost: number;
  electricityCost: number;
  labourCost: number;
  maintenanceCost: number;
  totalExpenditure: number;
  totalRevenue: number;
  expectedRevenue: number;
  estimatedProfit: number;
  netRealizedProfit: number;
  totalChickensSold: number;
  electricityUnits: number;
  categoryExpenses: {
    feed: number;
    medicine: number;
    electricity: number;
    labour: number;
    maintenance: number;
    other: number;
  };
  recentBatches?: Batch[];
  recentExpenses?: Expense[];
  recentSales?: SaleRecord[];
  monthlyChartData?: { month: string; expense: number; revenue: number; profit: number }[];
}

export interface FarmSettings {
  farmName: string;
  currency: string;
  language: string;
  theme: Theme;
  location?: string;
  ownerName?: string;
}

interface FarmState {
  user: User | null;
  isAuthenticated: boolean;
  theme: Theme;
  sidebarOpen: boolean;
  loading: boolean;
  lastSyncedAt: string | null;
  error: string | null;

  stats: DashboardStats;
  batches: Batch[];
  expenses: Expense[];
  billingHistory: BillingRecord[];
  sales: SaleRecord[];
  notifications: NotificationItem[];
  settings: FarmSettings;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Data Fetching & Sync
  fetchDashboardData: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchBillingHistory: () => Promise<void>;
  fetchSales: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  syncAll: () => Promise<void>;
  recalculateStats: () => void;

  // Data Mutations (Universal Client + Server Sync)
  createBatch: (data: Partial<Batch>) => Promise<{ success: boolean; error?: string }>;
  updateBatch: (id: string, data: Partial<Batch>) => Promise<{ success: boolean; error?: string }>;
  deleteBatch: (id: string) => Promise<{ success: boolean; error?: string }>;

  createDailyRecord: (data: { batchId: string; deadChicks: number; feedConsumed: number; averageWeight: number; notes?: string }) => Promise<{ success: boolean; error?: string }>;

  createExpense: (data: { category: string; amount: number; description: string; date?: string; batchId?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;

  createBillingCalculation: (data: Partial<BillingRecord>) => Promise<{ success: boolean; error?: string }>;
  deleteBillingCalculation: (id: string) => Promise<{ success: boolean; error?: string }>;

  createFeedRecord: (data: { batchId?: string; quantity: number; price: number; totalCost?: number; supplier?: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  createMedicineRecord: (data: { batchId?: string; medicineName: string; quantity: number; cost: number; purpose?: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  createLabourRecord: (data: { batchId?: string; employeeName: string; daysWorked: number; dailyWage: number; totalCost?: number }) => Promise<{ success: boolean; error?: string }>;
  createElectricityRecord: (data: { batchId?: string; unitsConsumed: number; amount: number; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  createMaintenanceRecord: (data: { batchId?: string; description: string; amount: number; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  createSaleRecord: (data: { batchId?: string; chickensSold: number; averageWeight: number; pricePerKg: number; buyer?: string; notes?: string; totalRevenue?: number; saleDate?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteSaleRecord: (id: string) => Promise<{ success: boolean; error?: string }>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  saveSettings: (settings: Partial<FarmSettings>) => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalBatches: 0,
  activeBatches: 0,
  completedBatches: 0,
  totalChicks: 0,
  aliveChicks: 0,
  deadChicks: 0,
  mortalityPercentage: 0,
  feedConsumed: 0,
  feedRemaining: 0,
  medicineCost: 0,
  electricityCost: 0,
  labourCost: 0,
  maintenanceCost: 0,
  totalExpenditure: 0,
  totalRevenue: 0,
  expectedRevenue: 0,
  estimatedProfit: 0,
  netRealizedProfit: 0,
  totalChickensSold: 0,
  electricityUnits: 0,
  categoryExpenses: { feed: 0, medicine: 0, electricity: 0, labour: 0, maintenance: 0, other: 0 },
  monthlyChartData: [
    { month: 'Oct', expense: 0, revenue: 0, profit: 0 },
    { month: 'Nov', expense: 0, revenue: 0, profit: 0 },
    { month: 'Dec', expense: 0, revenue: 0, profit: 0 },
    { month: 'Jan', expense: 0, revenue: 0, profit: 0 },
    { month: 'Feb', expense: 0, revenue: 0, profit: 0 },
  ],
};

const defaultSettings: FarmSettings = {
  farmName: 'GreenField Bio-Secure Poultry Farm',
  currency: '₹',
  language: 'en',
  theme: 'dark',
  location: 'Hyderabad, India',
  ownerName: 'Venkata Farms',
};

// Compute rich stats from client data
function computeStatsFromState(batches: Batch[], expenses: Expense[], sales: SaleRecord[] = []): DashboardStats {
  const totalBatches = batches.length;
  const activeBatches = batches.filter((b) => b.status === 'growing').length;
  const completedBatches = batches.filter((b) => b.status !== 'growing').length;

  const totalChicks = batches.reduce((sum, b) => sum + (b.totalChicks || 0), 0);
  const aliveChicks = batches.reduce((sum, b) => sum + (b.aliveChicks || 0), 0);
  const deadChicks = batches.reduce((sum, b) => sum + (b.deadChicks || 0), 0);
  const mortalityPercentage = totalChicks > 0 ? (deadChicks / totalChicks) * 100 : 0;

  const feedExpenses = expenses.filter((e) => e.category.toLowerCase() === 'feed').reduce((s, e) => s + e.amount, 0);
  const medExpenses = expenses.filter((e) => e.category.toLowerCase() === 'medicine' || e.category.toLowerCase() === 'vaccine').reduce((s, e) => s + e.amount, 0);
  const elecExpenses = expenses.filter((e) => e.category.toLowerCase() === 'electricity').reduce((s, e) => s + e.amount, 0);
  const labourExpenses = expenses.filter((e) => e.category.toLowerCase() === 'labour').reduce((s, e) => s + e.amount, 0);
  const maintExpenses = expenses.filter((e) => e.category.toLowerCase() === 'maintenance').reduce((s, e) => s + e.amount, 0);
  const otherExpenses = expenses.filter((e) => !['feed', 'medicine', 'vaccine', 'electricity', 'labour', 'maintenance'].includes(e.category.toLowerCase())).reduce((s, e) => s + e.amount, 0);

  const totalExpenditure = expenses.reduce((s, e) => s + e.amount, 0);
  const salesRevenue = sales.reduce((s, sale) => s + (sale.totalRevenue || 0), 0);
  const batchesRevenue = batches.reduce((s, b) => s + (b.totalRevenue || 0), 0);
  const totalRevenue = Math.max(salesRevenue, batchesRevenue) || (salesRevenue + batchesRevenue);
  const estimatedProfit = totalRevenue - totalExpenditure;
  const totalChickensSold = sales.reduce((s, sale) => s + (sale.chickensSold || 0), 0) || batches.reduce((s, b) => s + (b.totalChickensSold || 0), 0);

  return {
    totalBatches,
    activeBatches,
    completedBatches,
    totalChicks,
    aliveChicks,
    deadChicks,
    mortalityPercentage: Number(mortalityPercentage.toFixed(2)),
    feedConsumed: Math.round(totalChicks * 3.5),
    feedRemaining: totalChicks > 0 ? Math.max(0, Math.round(totalChicks * 3.8 - (feedExpenses > 0 ? feedExpenses / 45 : 0))) : 0,
    medicineCost: medExpenses,
    electricityCost: elecExpenses,
    labourCost: labourExpenses,
    maintenanceCost: maintExpenses,
    totalExpenditure,
    totalRevenue,
    expectedRevenue: aliveChicks * 2.2 * 115,
    estimatedProfit,
    netRealizedProfit: estimatedProfit,
    totalChickensSold,
    electricityUnits: Math.round(elecExpenses / 8),
    categoryExpenses: {
      feed: feedExpenses,
      medicine: medExpenses,
      electricity: elecExpenses,
      labour: labourExpenses,
      maintenance: maintExpenses,
      other: otherExpenses,
    },
    recentBatches: batches.slice(0, 5),
    recentExpenses: expenses.slice(0, 5),
    recentSales: sales.slice(0, 5),
    monthlyChartData: [
      { month: 'Oct', expense: Math.round(totalExpenditure * 0.6), revenue: Math.round(totalRevenue * 0.5), profit: Math.round(estimatedProfit * 0.5) },
      { month: 'Nov', expense: Math.round(totalExpenditure * 0.75), revenue: Math.round(totalRevenue * 0.7), profit: Math.round(estimatedProfit * 0.65) },
      { month: 'Dec', expense: Math.round(totalExpenditure * 0.85), revenue: Math.round(totalRevenue * 0.85), profit: Math.round(estimatedProfit * 0.8) },
      { month: 'Jan', expense: Math.round(totalExpenditure * 0.95), revenue: Math.round(totalRevenue * 0.95), profit: Math.round(estimatedProfit * 0.95) },
      { month: 'Feb', expense: totalExpenditure, revenue: totalRevenue, profit: estimatedProfit },
    ],
  };
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      theme: 'dark',
      sidebarOpen: true,
      loading: false,
      lastSyncedAt: null,
      error: null,

      stats: defaultStats,
      batches: [],
      expenses: [],
      billingHistory: [],
      sales: [],
      notifications: [],
      settings: defaultSettings,

      setTheme: (theme: Theme) => {
        const normalizedTheme: Theme =
          theme === 'obsidian' || theme === 'liquid-glass' ? 'liquid' : theme;
        set({ theme: normalizedTheme });
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('dark', 'obsidian', 'liquid-glass', 'liquid', 'organic', 'bubble');
          if (normalizedTheme === 'dark') {
            root.classList.add('dark');
          } else if (normalizedTheme === 'liquid') {
            root.classList.add('liquid', 'liquid-glass', 'obsidian');
          } else {
            root.classList.add('light');
          }
        }
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Strict Phone Authentication for exclusive admins John and Pranay
      loginWithPhone: async (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (ALLOWED_PHONES.includes(cleanPhone)) {
          const isJohn = cleanPhone === '9502828293';
          const userObj: User = {
            id: `usr-${cleanPhone}`,
            name: isJohn ? 'John' : 'Pranay',
            phone: cleanPhone,
            role: isJohn ? 'Farm Owner' : 'Manager & Tech Lead',
          };
          set({ user: userObj, isAuthenticated: true });
          get().recalculateStats();

          // Try server login in background
          try {
            fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: cleanPhone }),
            });
          } catch {
            // ignore
          }

          return { success: true };
        }
        return { success: false, error: 'Access Denied: Only John (9502828293) and Pranay (9849852085) are authorized admins.' };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      recalculateStats: () => {
        const { batches, expenses, sales } = get();
        const newStats = computeStatsFromState(batches, expenses, sales);
        set({ stats: newStats });
      },

      // Universal Safe Sync (never overwrites client data if server is empty)
      syncAll: async () => {
        await Promise.allSettled([
          get().fetchBatches(),
          get().fetchExpenses(),
          get().fetchBillingHistory(),
          get().fetchSales(),
          get().fetchNotifications(),
        ]);
        get().recalculateStats();
        set({ lastSyncedAt: new Date().toISOString() });
      },

      fetchDashboardData: async () => {
        try {
          const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data && data.totalBatches > 0) {
              set({ stats: data });
              return;
            }
          }
        } catch {
          // fallback to client computed stats
        }
        get().recalculateStats();
      },

      fetchBatches: async () => {
        try {
          const res = await fetch('/api/batches', { cache: 'no-store' });
          if (res.ok) {
            const serverBatches = await res.json();
            if (Array.isArray(serverBatches) && serverBatches.length > 0) {
              // Merge server batches with any newly created local batches
              const localBatches = get().batches;
              const serverIds = new Set(serverBatches.map((b: any) => b.id));
              const nonOverlappingLocal = localBatches.filter((b) => !serverIds.has(b.id));
              set({ batches: [...serverBatches, ...nonOverlappingLocal] });
            }
          }
        } catch {
          // preserve local batches
        }
      },

      fetchExpenses: async () => {
        try {
          const res = await fetch('/api/expenses', { cache: 'no-store' });
          if (res.ok) {
            const serverExp = await res.json();
            if (Array.isArray(serverExp) && serverExp.length > 0) {
              const localExp = get().expenses;
              const serverIds = new Set(serverExp.map((e: any) => e.id));
              const nonOverlapping = localExp.filter((e) => !serverIds.has(e.id));
              set({ expenses: [...serverExp, ...nonOverlapping] });
            }
          }
        } catch {
          // preserve local
        }
      },

      fetchBillingHistory: async () => {
        try {
          const res = await fetch('/api/billing', { cache: 'no-store' });
          if (res.ok) {
            const serverBilling = await res.json();
            if (Array.isArray(serverBilling) && serverBilling.length > 0) {
              const localBilling = get().billingHistory;
              const serverIds = new Set(serverBilling.map((b: any) => b.id));
              const nonOverlapping = localBilling.filter((b) => !serverIds.has(b.id));
              set({ billingHistory: [...serverBilling, ...nonOverlapping] });
            }
          }
        } catch {
          // preserve local
        }
      },

      fetchSales: async () => {
        try {
          const res = await fetch('/api/sales', { cache: 'no-store' });
          if (res.ok) {
            const serverSales = await res.json();
            if (Array.isArray(serverSales) && serverSales.length > 0) {
              const localSales = get().sales;
              const serverIds = new Set(serverSales.map((s: any) => s.id));
              const nonOverlapping = localSales.filter((s) => !serverIds.has(s.id));
              set({ sales: [...serverSales, ...nonOverlapping] });
            }
          }
        } catch {
          // preserve local
        }
      },

      fetchNotifications: async () => {
        try {
          const res = await fetch('/api/notifications', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) set({ notifications: data });
          }
        } catch {
          // ignore
        }
      },

      fetchSettings: async () => {
        try {
          const res = await fetch('/api/settings', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            set((s) => ({
              settings: {
                ...s.settings,
                farmName: data.farmName || s.settings.farmName,
                currency: data.currency || s.settings.currency,
                theme: (data.theme as Theme) || s.settings.theme,
              },
            }));
          }
        } catch {
          // ignore
        }
      },

      // ── UNIVERSAL BATCH CREATION (Client Instant + Server Sync) ──────────
      createBatch: async (batchData) => {
        const newId = `BATCH-${Date.now()}`;
        const total = Number(batchData.totalChicks) || 5000;
        const dead = Number(batchData.deadChicks) || 0;
        const alive = Math.max(0, total - dead);
        const duration = Number(batchData.durationDays) || 45;
        const mortality = total > 0 ? (dead / total) * 100 : 0;

        const start = batchData.startDate || new Date().toISOString().split('T')[0];
        const startDateObj = new Date(start);
        const endDateObj = new Date(startDateObj.getTime() + duration * 24 * 60 * 60 * 1000);

        const newBatch: Batch = {
          id: newId,
          batchNumber: batchData.batchNumber || `B-${new Date().getFullYear()}-${String(get().batches.length + 1).padStart(2, '0')}`,
          batchName: batchData.batchName || `Batch ${batchData.batchNumber || 'New'}`,
          breedType: batchData.breedType || 'Cobb 500 (Broiler)',
          startDate: start,
          expectedEndDate: endDateObj.toISOString().split('T')[0],
          actualEndDate: null,
          durationDays: duration,
          totalChicks: total,
          aliveChicks: alive,
          deadChicks: dead,
          mortalityPercentage: Number(mortality.toFixed(2)),
          daysElapsed: 1,
          daysRemaining: duration,
          growthProgress: 2,
          status: (batchData.status as any) || 'growing',
          notes: batchData.notes || '',
          totalExpenditure: 0,
          costPerChick: 0,
          totalRevenue: 0,
          totalChickensSold: 0,
          netProfit: 0,
          profitPerChick: 0,
          createdAt: new Date().toISOString(),
        };

        // 1. Save to state & LocalStorage immediately
        set((state) => {
          const updatedBatches = [newBatch, ...state.batches];
          const updatedStats = computeStatsFromState(updatedBatches, state.expenses);
          return {
            batches: updatedBatches,
            stats: updatedStats,
          };
        });

        // 2. Sync to Server DB
        try {
          const res = await fetch('/api/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBatch),
          });
          if (res.ok) {
            const serverBatch = await res.json();
            if (serverBatch && serverBatch.id) {
              set((state) => ({
                batches: state.batches.map((b) => (b.id === newId ? { ...b, id: serverBatch.id } : b)),
              }));
            }
          }
        } catch {
          // client persistence already ensured
        }

        return { success: true };
      },

      updateBatch: async (id, data) => {
        set((state) => {
          const updatedBatches = state.batches.map((b) => {
            if (b.id !== id) return b;
            const total = Number(data.totalChicks ?? b.totalChicks);
            const dead = Number(data.deadChicks ?? b.deadChicks);
            const alive = Math.max(0, total - dead);
            const mortality = total > 0 ? (dead / total) * 100 : 0;
            return {
              ...b,
              ...data,
              totalChicks: total,
              deadChicks: dead,
              aliveChicks: alive,
              mortalityPercentage: Number(mortality.toFixed(2)),
            };
          });
          const updatedStats = computeStatsFromState(updatedBatches, state.expenses);
          return { batches: updatedBatches, stats: updatedStats };
        });

        try {
          fetch(`/api/batches/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch {
          // ignore
        }

        return { success: true };
      },

      deleteBatch: async (id) => {
        set((state) => {
          const updatedBatches = state.batches.filter((b) => b.id !== id);
          const updatedExpenses = state.expenses.filter((e) => e.batchId !== id);
          const updatedStats = computeStatsFromState(updatedBatches, updatedExpenses);
          return {
            batches: updatedBatches,
            expenses: updatedExpenses,
            stats: updatedStats,
          };
        });

        try {
          fetch(`/api/batches/${id}`, { method: 'DELETE' });
        } catch {
          // ignore
        }

        return { success: true };
      },

      createDailyRecord: async (data) => {
        const dead = Number(data.deadChicks) || 0;
        const feed = Number(data.feedConsumed) || 0;

        set((state) => {
          const updatedBatches = state.batches.map((b) => {
            if (b.id !== data.batchId) return b;
            const newDead = b.deadChicks + dead;
            const newAlive = Math.max(0, b.totalChicks - newDead);
            const mortality = b.totalChicks > 0 ? (newDead / b.totalChicks) * 100 : 0;
            return {
              ...b,
              deadChicks: newDead,
              aliveChicks: newAlive,
              mortalityPercentage: Number(mortality.toFixed(2)),
            };
          });

          // Add feed expense if feed consumed
          let updatedExpenses = state.expenses;
          if (feed > 0) {
            const feedCost = Math.round(feed * 38);
            const newExp: Expense = {
              id: `EXP-FEED-${Date.now()}`,
              category: 'Feed',
              amount: feedCost,
              date: new Date().toISOString().split('T')[0],
              description: `Daily feed consumption (${feed} kg)`,
              batchId: data.batchId,
              createdAt: new Date().toISOString(),
            };
            updatedExpenses = [newExp, ...state.expenses];
          }

          const updatedStats = computeStatsFromState(updatedBatches, updatedExpenses);
          return {
            batches: updatedBatches,
            expenses: updatedExpenses,
            stats: updatedStats,
          };
        });

        try {
          fetch('/api/daily-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch {
          // ignore
        }

        return { success: true };
      },

      // ── UNIVERSAL BILLING CALCULATOR SAVE ────────────────────────────────
      createBillingCalculation: async (calcData) => {
        const newRecord: BillingRecord = {
          id: `CALC-${Date.now()}`,
          type: calcData.type || 'chick_purchase',
          chickRate: calcData.chickRate ? Number(calcData.chickRate) : null,
          numberOfChicks: calcData.numberOfChicks ? Number(calcData.numberOfChicks) : null,
          feedBags: calcData.feedBags ? Number(calcData.feedBags) : null,
          fcrScore: calcData.fcrScore ? Number(calcData.fcrScore) : null,
          totalAmount: Number(calcData.totalAmount) || 0,
          notes: calcData.notes || '',
          batchId: calcData.batchId || null,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          billingHistory: [newRecord, ...state.billingHistory],
        }));

        try {
          fetch('/api/billing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calcData),
          });
        } catch {
          // ignore
        }

        return { success: true };
      },

      deleteBillingCalculation: async (id) => {
        set((state) => ({
          billingHistory: state.billingHistory.filter((b) => b.id !== id),
        }));

        try {
          fetch(`/api/billing/${id}`, { method: 'DELETE' });
        } catch {
          // ignore
        }

        return { success: true };
      },

      // ── UNIVERSAL EXPENSE CREATION ────────────────────────────────────────
      createExpense: async (data) => {
        const newExp: Expense = {
          id: `EXP-${Date.now()}`,
          category: data.category || 'General',
          amount: Number(data.amount) || 0,
          description: data.description || '',
          date: data.date || new Date().toISOString().split('T')[0],
          batchId: data.batchId || null,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedExpenses = [newExp, ...state.expenses];
          const updatedStats = computeStatsFromState(state.batches, updatedExpenses);
          return {
            expenses: updatedExpenses,
            stats: updatedStats,
          };
        });

        try {
          fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch {
          // ignore
        }

        return { success: true };
      },

      deleteExpense: async (id) => {
        set((state) => {
          const updatedExpenses = state.expenses.filter((e) => e.id !== id);
          const updatedStats = computeStatsFromState(state.batches, updatedExpenses);
          return {
            expenses: updatedExpenses,
            stats: updatedStats,
          };
        });

        try {
          fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        } catch {
          // ignore
        }

        return { success: true };
      },

      createFeedRecord: async (data) => {
        const cost = data.totalCost || (Number(data.quantity) || 0) * (Number(data.price) || 0);
        return get().createExpense({
          category: 'Feed',
          amount: cost,
          description: `Feed Purchase: ${data.quantity} bags @ ₹${data.price}/bag (${data.supplier || 'Supplier'})`,
          batchId: data.batchId,
        });
      },

      createMedicineRecord: async (data) => {
        return get().createExpense({
          category: 'Medicine',
          amount: Number(data.cost) || 0,
          description: `${data.medicineName} (${data.purpose || 'Vaccine/Med'})`,
          batchId: data.batchId,
        });
      },

      createLabourRecord: async (data) => {
        const cost = data.totalCost || (Number(data.daysWorked) || 1) * (Number(data.dailyWage) || 600);
        return get().createExpense({
          category: 'Labour',
          amount: cost,
          description: `Worker: ${data.employeeName} (${data.daysWorked} days @ ₹${data.dailyWage}/day)`,
          batchId: data.batchId,
        });
      },

      createElectricityRecord: async (data) => {
        return get().createExpense({
          category: 'Electricity',
          amount: Number(data.amount) || 0,
          description: `Power bill: ${data.unitsConsumed || 0} Units (${data.notes || 'Monthly'})`,
          batchId: data.batchId,
        });
      },

      createMaintenanceRecord: async (data) => {
        return get().createExpense({
          category: 'Maintenance',
          amount: Number(data.amount) || 0,
          description: data.description || 'Repairs & Upkeep',
          batchId: data.batchId,
        });
      },

      createSaleRecord: async (data) => {
        const birdsSold = Number(data.chickensSold) || 0;
        const avgW = Number(data.averageWeight) || 0;
        const rateKg = Number(data.pricePerKg) || 0;
        const calculatedRevenue = data.totalRevenue || (birdsSold * avgW * rateKg);
        const saleId = `SALE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const dateStr = data.saleDate || new Date().toISOString().split('T')[0];

        const newSale: SaleRecord = {
          id: saleId,
          batchId: data.batchId || null,
          chickensSold: birdsSold,
          averageWeight: avgW,
          pricePerKg: rateKg,
          totalRevenue: calculatedRevenue,
          buyer: data.buyer || 'Commercial Buyer',
          notes: data.notes || null,
          saleDate: dateStr,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedSales = [newSale, ...state.sales];
          const updatedBatches = state.batches.map((b) => {
            if (b.id !== data.batchId) return b;
            return {
              ...b,
              totalRevenue: (b.totalRevenue || 0) + calculatedRevenue,
              totalChickensSold: (b.totalChickensSold || 0) + birdsSold,
            };
          });
          const updatedStats = computeStatsFromState(updatedBatches, state.expenses, updatedSales);
          return {
            sales: updatedSales,
            batches: updatedBatches,
            stats: updatedStats,
          };
        });

        try {
          fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              id: saleId,
              totalRevenue: calculatedRevenue,
            }),
          }).catch(() => {});
        } catch {
          // ignore
        }

        return { success: true };
      },

      deleteSaleRecord: async (id: string) => {
        set((state) => {
          const saleToDelete = state.sales.find((s) => s.id === id);
          const updatedSales = state.sales.filter((s) => s.id !== id);
          let updatedBatches = state.batches;
          if (saleToDelete && saleToDelete.batchId) {
            updatedBatches = state.batches.map((b) => {
              if (b.id !== saleToDelete.batchId) return b;
              return {
                ...b,
                totalRevenue: Math.max(0, (b.totalRevenue || 0) - (saleToDelete.totalRevenue || 0)),
                totalChickensSold: Math.max(0, (b.totalChickensSold || 0) - (saleToDelete.chickensSold || 0)),
              };
            });
          }
          const updatedStats = computeStatsFromState(updatedBatches, state.expenses, updatedSales);
          return {
            sales: updatedSales,
            batches: updatedBatches,
            stats: updatedStats,
          };
        });

        try {
          fetch(`/api/sales/${id}`, { method: 'DELETE' }).catch(() => {});
        } catch {}

        return { success: true };
      },

      markNotificationRead: async (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },

      markAllNotificationsRead: async () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      saveSettings: async (newSettings) => {
        set((s) => ({ settings: { ...s.settings, ...newSettings } }));
        try {
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings),
          });
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'chickfarm-master-persistence-v3',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        batches: state.batches,
        expenses: state.expenses,
        billingHistory: state.billingHistory,
        notifications: state.notifications,
        settings: state.settings,
        stats: state.stats,
      }),
    }
  )
);
