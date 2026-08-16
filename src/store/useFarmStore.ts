'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'obsidian';

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

// ─── Per-phone localStorage helpers ──────────────────────────────────────────

interface PhoneData {
  batches: Batch[];
  expenses: Expense[];
  revenues: Revenue[];
  notifications: Notification[];
  settings: Settings;
}

function phoneKey(phone: string): string {
  return `chickfarm-user-${phone.replace(/[^0-9a-z]/gi, '')}`;
}

function saveToPhone(phone: string, data: PhoneData): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(phoneKey(phone), JSON.stringify(data)); } catch { /* ignore */ }
}

function loadFromPhone(phone: string): PhoneData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(phoneKey(phone));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Default values ──────────────────────────────────────────────────────────

const defaultUser: User = {
  id: uuidv4(), name: 'John', email: 'admin@chickfarm.com',
  role: 'admin', avatar: undefined, createdAt: '2026-01-01T00:00:00Z',
};

const defaultSettings: Settings = {
  farmName: 'GreenField Poultry Farm', currency: '₹', language: 'en', theme: 'light',
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

// ─── Helper: save current state to phone storage ─────────────────────────────

function persistToPhone(get: () => FarmState) {
  const s = get();
  if (!s.currentPhone) return;
  saveToPhone(s.currentPhone, {
    batches: s.batches, expenses: s.expenses, revenues: s.revenues,
    notifications: s.notifications, settings: s.settings,
  });
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      currentPhone: null,

      // ── Auth ──────────────────────────────────────────────────────
      login: (email, password) => {
        if (email === 'admin@chickfarm.com' && password === 'admin123') {
          const phone = 'admin';
          const existing = loadFromPhone(phone);
          set({
            user: { ...defaultUser }, isAuthenticated: true, currentPhone: phone,
            batches: existing?.batches ?? [], expenses: existing?.expenses ?? [],
            revenues: existing?.revenues ?? [], notifications: existing?.notifications ?? [],
            settings: existing?.settings ?? { ...defaultSettings, theme: get().theme },
          });
          return true;
        }
        return false;
      },

      loginWithPhone: (phone) => {
        const clean = phone.replace(/[^0-9]/g, '');
        if (!ALLOWED_PHONES.includes(clean)) {
          return { success: false, error: 'This phone number is not authorized.' };
        }
        const existing = loadFromPhone(clean);
        set({
          user: { ...defaultUser, id: uuidv4(), name: `User ${clean.slice(-4)}`, phone: clean },
          isAuthenticated: true, currentPhone: clean,
          batches: existing?.batches ?? [], expenses: existing?.expenses ?? [],
          revenues: existing?.revenues ?? [], notifications: existing?.notifications ?? [],
          settings: existing?.settings ?? { ...defaultSettings, theme: get().theme },
        });
        return { success: true };
      },

      logout: () => {
        persistToPhone(get); // save before logout
        set({
          user: null, isAuthenticated: false, currentPhone: null,
          batches: [], expenses: [], revenues: [], notifications: [],
          settings: defaultSettings,
        });
      },

      // ── Theme ─────────────────────────────────────────────────────
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark', 'obsidian');
          if (theme !== 'light') document.documentElement.classList.add(theme);
        }
        persistToPhone(get);
      },
      cycleTheme: () => {
        const cur = get().theme;
        get().setTheme(cur === 'light' ? 'dark' : cur === 'dark' ? 'obsidian' : 'light');
      },

      // ── Sidebar ───────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ── Batches ───────────────────────────────────────────────────
      batches: [],
      addBatch: (batch) => {
        const newBatch: Batch = {
          ...batch, id: uuidv4(),
          chicksAlive: batch.totalChicks - batch.chicksDead,
          mortalityPercentage: batch.totalChicks > 0 ? (batch.chicksDead / batch.totalChicks) * 100 : 0,
          dailyMortality: [], createdAt: new Date().toISOString(),
        };
        set((s) => ({ batches: [...s.batches, newBatch] }));
        setTimeout(() => persistToPhone(get), 0);
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
        setTimeout(() => persistToPhone(get), 0);
      },
      deleteBatch: (id) => { set((s) => ({ batches: s.batches.filter((b) => b.id !== id) })); setTimeout(() => persistToPhone(get), 0); },
      recordMortality: (batchId, deaths) => {
        set((s) => ({
          batches: s.batches.map((b) => {
            if (b.id !== batchId) return b;
            const nd = b.chicksDead + deaths;
            const d = new Date().toISOString().split('T')[0];
            const lc = b.dailyMortality.length > 0 ? b.dailyMortality[b.dailyMortality.length - 1].cumulative : 0;
            return { ...b, chicksDead: nd, chicksAlive: b.totalChicks - nd,
              mortalityPercentage: b.totalChicks > 0 ? (nd / b.totalChicks) * 100 : 0,
              dailyMortality: [...b.dailyMortality, { date: d, deaths, cumulative: lc + deaths }] };
          }),
        }));
        setTimeout(() => persistToPhone(get), 0);
      },

      // ── Expenses ──────────────────────────────────────────────────
      expenses: [],
      addExpense: (expense) => { set((s) => ({ expenses: [...s.expenses, { ...expense, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(() => persistToPhone(get), 0); },
      updateExpense: (id, updates) => { set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)) })); setTimeout(() => persistToPhone(get), 0); },
      deleteExpense: (id) => { set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })); setTimeout(() => persistToPhone(get), 0); },

      // ── Revenue ───────────────────────────────────────────────────
      revenues: [],
      addRevenue: (rev) => {
        const gr = rev.sellingPricePerChicken * rev.totalChickensSold;
        set((s) => ({ revenues: [...s.revenues, { ...rev, id: uuidv4(), grossRevenue: gr, createdAt: new Date().toISOString() }] }));
        setTimeout(() => persistToPhone(get), 0);
      },
      updateRevenue: (id, updates) => { set((s) => ({ revenues: s.revenues.map((r) => (r.id === id ? { ...r, ...updates } : r)) })); setTimeout(() => persistToPhone(get), 0); },
      deleteRevenue: (id) => { set((s) => ({ revenues: s.revenues.filter((r) => r.id !== id) })); setTimeout(() => persistToPhone(get), 0); },

      // ── Notifications ─────────────────────────────────────────────
      notifications: [],
      addNotification: (n) => { set((s) => ({ notifications: [{ ...n, id: uuidv4(), read: false, createdAt: new Date().toISOString() }, ...s.notifications] })); setTimeout(() => persistToPhone(get), 0); },
      markNotificationRead: (id) => { set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })); setTimeout(() => persistToPhone(get), 0); },
      markAllNotificationsRead: () => { set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })); setTimeout(() => persistToPhone(get), 0); },
      deleteNotification: (id) => { set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })); setTimeout(() => persistToPhone(get), 0); },

      // ── Settings ──────────────────────────────────────────────────
      settings: defaultSettings,
      updateSettings: (updates) => { set((s) => ({ settings: { ...s.settings, ...updates } })); setTimeout(() => persistToPhone(get), 0); },

      // ── Computed ──────────────────────────────────────────────────
      getDashboardStats: () => {
        const s = get();
        const active = s.batches.filter((b) => b.status === 'growing');
        const totalChicks = s.batches.reduce((sum, b) => sum + b.totalChicks, 0);
        const aliveChicks = active.reduce((sum, b) => sum + b.chicksAlive, 0);
        const deadChicks = s.batches.reduce((sum, b) => sum + b.chicksDead, 0);
        const byCat = (c: string) => s.expenses.filter((e) => e.category === c).reduce((sum, e) => sum + e.amount, 0);
        const totalExp = s.expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalRev = s.revenues.reduce((sum, r) => sum + r.grossRevenue, 0);
        const expectedRev = totalRev + active.reduce((sum, b) => sum + 175 * b.chicksAlive, 0);
        return {
          totalBatches: s.batches.length, activeBatches: active.length, totalChicks, aliveChicks, deadChicks,
          mortalityPercentage: totalChicks > 0 ? (deadChicks / totalChicks) * 100 : 0,
          feedConsumed: byCat('feed'), feedRemaining: 250000 - (byCat('feed') % 250000),
          medicineCost: byCat('medicine'), electricityCost: byCat('electricity'),
          labourCost: byCat('labour'), maintenanceCost: byCat('maintenance'),
          totalExpenditure: totalExp, totalRevenue: totalRev, expectedRevenue: expectedRev, estimatedProfit: expectedRev - totalExp,
        };
      },
      getBatchExpenses: (batchId) => get().expenses.filter((e) => e.batchId === batchId),
      getBatchRevenue: (batchId) => get().revenues.filter((r) => r.batchId === batchId),
      getExpensesByCategory: () =>
        get().expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>),
    }),
    {
      name: 'chickfarm-auth',
      partialize: (state) => ({
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        currentPhone: state.currentPhone,
        // Also persist farm data so it survives refresh
        batches: state.batches,
        expenses: state.expenses,
        revenues: state.revenues,
        notifications: state.notifications,
        settings: state.settings,
      }),
    }
  )
);
