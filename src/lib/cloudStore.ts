// ====================================================
// CENTRALIZED CLOUD DATABASE ADAPTER (UPSTASH SERVERLESS)
// Synchronizes 100% of farm data across Laptop A, Laptop B, mobile, etc.
// ====================================================

const CLOUD_URL =
  process.env.UPSTASH_REDIS_REST_URL || 'https://fresh-sawfly-143753.upstash.io';
const CLOUD_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAjGJAQIgcDJkN2Y5ODVkMjZkMTY0NzIyOGRhNWNjMGUyMGU2MDA0Yw';

async function redisCommand(command: any[]) {
  try {
    const res = await fetch(CLOUD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch (e) {
    console.error('Cloud Redis Error:', e);
    return null;
  }
}

export const cloudDb = {
  async get<T>(key: string): Promise<T | null> {
    const result = await redisCommand(['GET', `chickfarm:${key}`]);
    if (!result) return null;
    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch {
      return result as any;
    }
  },

  async set(key: string, value: any): Promise<boolean> {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const result = await redisCommand(['SET', `chickfarm:${key}`, str]);
    return result === 'OK';
  },

  async delete(key: string): Promise<boolean> {
    const result = await redisCommand(['DEL', `chickfarm:${key}`]);
    return result > 0;
  },

  // ── Unified Cloud Farm Snapshot ──
  async getFarmData() {
    const [batches, expenses, sales, billing, settings, notifications] = await Promise.all([
      this.get<any[]>('batches'),
      this.get<any[]>('expenses'),
      this.get<any[]>('sales'),
      this.get<any[]>('billing'),
      this.get<any>('settings'),
      this.get<any[]>('notifications'),
    ]);

    return {
      batches: Array.isArray(batches) ? batches : [],
      expenses: Array.isArray(expenses) ? expenses : [],
      sales: Array.isArray(sales) ? sales : [],
      billingHistory: Array.isArray(billing) ? billing : [],
      settings: settings || null,
      notifications: Array.isArray(notifications) ? notifications : [],
      lastSynced: new Date().toISOString(),
    };
  },

  async saveBatches(batches: any[]) {
    return this.set('batches', batches);
  },

  async saveExpenses(expenses: any[]) {
    return this.set('expenses', expenses);
  },

  async saveSales(sales: any[]) {
    return this.set('sales', sales);
  },

  async saveBilling(billing: any[]) {
    return this.set('billing', billing);
  },

  async saveSettings(settings: any) {
    return this.set('settings', settings);
  },

  async saveNotifications(notifications: any[]) {
    return this.set('notifications', notifications);
  },
};
