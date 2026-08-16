'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'obsidian';

// Allowed phone numbers (only these can log in)
export const ALLOWED_PHONES = ['9502828293', '9849852085'];

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  breedType: string;
  totalChicks: number;
  chicksDead: number;
  chicksAlive: number;
  mortalityPercentage: number;
  status: 'growing' | 'sold' | 'completed';
  startDate: string;
  expectedEndDate: string;
  dailyMortality: { date: string; deaths: number; cumulative: number }[];
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: 'feed' | 'medicine' | 'electricity' | 'labour' | 'maintenance' | 'other';
  description: string;
  amount: number;
  date: string;
  batchId?: string;
  createdAt: string;
}

export interface Revenue {
  id: string;
  batchId?: string;
  totalChickensSold: number;
  sellingPricePerChicken: number;
  grossRevenue: number;
  buyerName: string;
  date: string;
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

export interface Settings {
  farmName: string;
  currency: string;
  language: string;
  theme: Theme;
}

export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
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
}

// ─── Default user (used for admin login) ─────────────────────────────────────

const defaultUser: User = {
  id: uuidv4(),
  name: 'John',
  email: 'admin@chickfarm.com',
  role: 'admin',
  avatar: undefined,
  createdAt: '2026-01-01T00:00:00Z',
};

const defaultSettings: Settings = {
  farmName: 'GreenField Poultry Farm',
  currency: '₹',
  language: 'en',
  theme: 'light',
};

// ─── Store Interface ─────────────────────────────────────────────────────────

interface FarmState {
  user: User | null;
  isAuthenticated: boolean;
  currentPhone: string | null;
  login: (email: string, password: string) => boolean;
  loginWithPhone: (phone: string) => { success: boolean; error?: string };
  logout: () => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  batches: Batch[];
  addBatch: (batch: Omit<Batch, 'id' | 'chicksAlive' | 'mortalityPercentage' | 'dailyMortality' | 'createdAt'>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  recordMortality: (batchId: string, deaths: number) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, 'id' | 'grossRevenue' | 'createdAt'>) => void;
  updateRevenue: (id: string, updates: Partial<Revenue>) => void;
  deleteRevenue: (id: string) => void;

  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;

  getDashboardStats: () => DashboardStats;
  getBatchExpenses: (batchId: string) => Expense[];
  getBatchRevenue: (batchId: string) => Revenue[];
  getExpensesByCategory: () => Record<string, number>;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      currentPhone: null,

      login: (email: string, password: string) => {
        if (email === 'admin@chickfarm.com' && password === 'admin123') {
          set({ user: { ...defaultUser, id: defaultUser.id }, isAuthenticated: true, currentPhone: 'admin' });
          return true;
        }
        return false;
      },

      loginWithPhone: (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!ALLOWED_PHONES.includes(cleanPhone)) {
          return { success: false, error: 'This phone number is not authorized. Contact your administrator.' };
        }
        set({
          user: { ...defaultUser, id: defaultUser.id, name: `User ${cleanPhone.slice(-4)}`, phone: cleanPhone },
          isAuthenticated: true,
          currentPhone: cleanPhone,
        });
        return { success: true };
      },

      logout: () => set({ user: null, isAuthenticated: false, currentPhone: null }),

      // ── Theme (3-way: light, dark, obsidian) ──────────────────────
      theme: 'light',
      setTheme: (theme: Theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark', 'obsidian');
          if (theme !== 'light') document.documentElement.classList.add(theme);
        }
      },
      cycleTheme: () => {
        const current = get().theme;
        const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'obsidian' : 'light';
        get().setTheme(next);
      },

      // ── Sidebar ───────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ── Batches ───────────────────────────────────────────────────
      batches: [],
      addBatch: (batch) => {
        const newBatch: Batch = {
          ...batch,
          id: uuidv4(),
          chicksAlive: batch.totalChicks - batch.chicksDead,
          mortalityPercentage: batch.totalChicks > 0 ? (batch.chicksDead / batch.totalChicks) * 100 : 0,
          dailyMortality: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ batches: [...s.batches, newBatch] }));
      },
      updateBatch: (id, updates) => {
        set((s) => ({
          batches: s.batches.map((b) => {
            if (b.id !== id) return b;
            const u = { ...b, ...updates };
            u.chicksAlive = u.totalChicks - u.chicksDead;
            u.mortalityPercentage = u.totalChicks > 0 ? (u.chicksDead / u.totalChicks) * 100 : 0;
            return u;
          }),
        }));
      },
      deleteBatch: (id) => set((s) => ({ batches: s.batches.filter((b) => b.id !== id) })),
      recordMortality: (batchId, deaths) => {
        set((s) => ({
          batches: s.batches.map((b) => {
            if (b.id !== batchId) return b;
            const newDead = b.chicksDead + deaths;
            const date = new Date().toISOString().split('T')[0];
            const lastCum = b.dailyMortality.length > 0 ? b.dailyMortality[b.dailyMortality.length - 1].cumulative : 0;
            return {
              ...b, chicksDead: newDead, chicksAlive: b.totalChicks - newDead,
              mortalityPercentage: b.totalChicks > 0 ? (newDead / b.totalChicks) * 100 : 0,
              dailyMortality: [...b.dailyMortality, { date, deaths, cumulative: lastCum + deaths }],
            };
          }),
        }));
      },

      // ── Expenses ──────────────────────────────────────────────────
      expenses: [],
      addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, { ...expense, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      updateExpense: (id, updates) => set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)) })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // ── Revenue ───────────────────────────────────────────────────
      revenues: [],
      addRevenue: (revenue) => {
        const grossRevenue = revenue.sellingPricePerChicken * revenue.totalChickensSold;
        set((s) => ({ revenues: [...s.revenues, { ...revenue, id: uuidv4(), grossRevenue, createdAt: new Date().toISOString() }] }));
      },
      updateRevenue: (id, updates) => set((s) => ({ revenues: s.revenues.map((r) => (r.id === id ? { ...r, ...updates } : r)) })),
      deleteRevenue: (id) => set((s) => ({ revenues: s.revenues.filter((r) => r.id !== id) })),

      // ── Notifications ─────────────────────────────────────────────
      notifications: [],
      addNotification: (notification) => {
        set((s) => ({
          notifications: [{ ...notification, id: uuidv4(), read: false, createdAt: new Date().toISOString() }, ...s.notifications],
        }));
      },
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      deleteNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      // ── Settings ──────────────────────────────────────────────────
      settings: defaultSettings,
      updateSettings: (updates) => set((s) => ({ settings: { ...s.settings, ...updates } })),

      // ── Derived / Computed ────────────────────────────────────────
      getDashboardStats: () => {
        const s = get();
        const active = s.batches.filter((b) => b.status === 'growing');
        const totalChicks = s.batches.reduce((sum, b) => sum + b.totalChicks, 0);
        const aliveChicks = active.reduce((sum, b) => sum + b.chicksAlive, 0);
        const deadChicks = s.batches.reduce((sum, b) => sum + b.chicksDead, 0);
        const byCategory = (cat: string) => s.expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
        const totalExp = s.expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalRev = s.revenues.reduce((sum, r) => sum + r.grossRevenue, 0);
        const expectedRev = totalRev + active.reduce((sum, b) => sum + 175 * b.chicksAlive, 0);
        return {
          totalBatches: s.batches.length, activeBatches: active.length, totalChicks, aliveChicks, deadChicks,
          mortalityPercentage: totalChicks > 0 ? (deadChicks / totalChicks) * 100 : 0,
          feedConsumed: byCategory('feed'), feedRemaining: 250000 - (byCategory('feed') % 250000),
          medicineCost: byCategory('medicine'), electricityCost: byCategory('electricity'),
          labourCost: byCategory('labour'), maintenanceCost: byCategory('maintenance'),
          totalExpenditure: totalExp, totalRevenue: totalRev, expectedRevenue: expectedRev, estimatedProfit: expectedRev - totalExp,
        };
      },
      getBatchExpenses: (batchId) => get().expenses.filter((e) => e.batchId === batchId),
      getBatchRevenue: (batchId) => get().revenues.filter((r) => r.batchId === batchId),
      getExpensesByCategory: () =>
        get().expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>),
    }),
    {
      name: 'chicken-farm-v2',
      partialize: (state) => ({
        batches: state.batches,
        expenses: state.expenses,
        revenues: state.revenues,
        notifications: state.notifications,
        settings: state.settings,
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        currentPhone: state.currentPhone,
      }),
    }
  )
);
