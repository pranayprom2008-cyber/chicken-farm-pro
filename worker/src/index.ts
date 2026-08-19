/**
 * ==========================================================
 * CHICKEN FARM PRO - CLOUDFLARE WORKER EDGE API
 * ==========================================================
 * Serverless Edge API layer connected directly to Cloudflare D1.
 */

export interface D1Database {
  prepare(query: string): any;
  batch(statements: any[]): Promise<any>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

// Helper to set CORS headers allowing Vercel production and local development
function corsHeaders(origin: string | null) {
  const allowedOrigin = origin || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Farm-Id',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data: any, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const farmId = request.headers.get('X-Farm-Id') || 'farm_main';

    try {
      // 1. HEALTH / STATUS
      if (path === '/' || path === '/api/health') {
        return jsonResponse({ status: 'online', db: 'cloudflare-d1', timestamp: new Date().toISOString() }, 200, origin);
      }

      // 2. AUTH LOGIN
      if (path === '/api/auth/login' && method === 'POST') {
        const body: any = await request.json();
        const { phone, pin } = body;
        const user = await env.DB.prepare('SELECT id, farm_id, name, phone, role FROM users WHERE phone = ? AND pin = ?')
          .bind(phone, pin || '1234')
          .first();

        if (user) {
          return jsonResponse({ success: true, user }, 200, origin);
        }
        return jsonResponse({ error: 'Invalid phone or PIN' }, 401, origin);
      }

      // 3. FARM SUMMARY / DASHBOARD STATS
      if (path === '/api/farm/summary' || path === '/api/dashboard/stats') {
        const batchStats = await env.DB.prepare(`
          SELECT 
            COUNT(*) as totalBatches,
            SUM(CASE WHEN status = 'growing' THEN 1 ELSE 0 END) as activeBatches,
            SUM(total_chicks) as totalChicks,
            SUM(alive_chicks) as aliveChicks,
            SUM(dead_chicks) as deadChicks
          FROM batches WHERE farm_id = ?
        `).bind(farmId).first<{ totalBatches: number; activeBatches: number; totalChicks: number; aliveChicks: number; deadChicks: number }>();

        const expenseStats = await env.DB.prepare(`
          SELECT COALESCE(SUM(amount), 0) as totalExpenditure FROM expenses WHERE farm_id = ?
        `).bind(farmId).first<{ totalExpenditure: number }>();

        const salesStats = await env.DB.prepare(`
          SELECT 
            COALESCE(SUM(total_revenue), 0) as totalRevenue,
            COALESCE(SUM(chickens_sold), 0) as totalChickensSold
          FROM sales WHERE farm_id = ?
        `).bind(farmId).first<{ totalRevenue: number; totalChickensSold: number }>();

        const totalChicks = batchStats?.totalChicks || 0;
        const aliveChicks = batchStats?.aliveChicks || 0;
        const deadChicks = batchStats?.deadChicks || 0;
        const mortalityRate = totalChicks > 0 ? (deadChicks / totalChicks) * 100 : 0;
        const totalRevenue = salesStats?.totalRevenue || 0;
        const totalExpenditure = expenseStats?.totalExpenditure || 0;
        const netProfit = totalRevenue - totalExpenditure;

        return jsonResponse({
          totalChicks,
          aliveChicks,
          deadChicks,
          mortalityRate: Number(mortalityRate.toFixed(2)),
          totalBatches: batchStats?.totalBatches || 0,
          activeBatches: batchStats?.activeBatches || 0,
          totalExpenditure,
          totalRevenue,
          netProfit,
          totalChickensSold: salesStats?.totalChickensSold || 0,
        }, 200, origin);
      }

      // 4. BATCHES
      if (path === '/api/batches') {
        if (method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM batches WHERE farm_id = ? ORDER BY created_at DESC')
            .bind(farmId)
            .all();
          return jsonResponse(results || [], 200, origin);
        }

        if (method === 'POST') {
          const body: any = await request.json();
          const id = body.id || `BATCH-${Date.now()}`;
          const batchNumber = String(body.batchNumber || '').trim();
          const batchName = body.batchName || `Batch ${batchNumber}`;
          const breedType = body.breedType || 'Cobb 500 (Broiler)';
          const startDate = body.startDate || new Date().toISOString();
          const durationDays = Number(body.durationDays) || 45;
          const expectedEndDate = body.expectedEndDate || new Date(Date.now() + durationDays * 86400000).toISOString();
          const totalChicks = Number(body.totalChicks) || 5000;
          const deadChicks = Number(body.deadChicks) || 0;
          const aliveChicks = Math.max(0, totalChicks - deadChicks);
          const mortalityPercentage = totalChicks > 0 ? (deadChicks / totalChicks) * 100 : 0;
          const status = body.status || 'growing';
          const notes = body.notes || '';

          await env.DB.prepare(`
            INSERT INTO batches (id, farm_id, batch_number, batch_name, breed_type, start_date, expected_end_date, duration_days, total_chicks, alive_chicks, dead_chicks, mortality_percentage, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, farmId, batchNumber, batchName, breedType, startDate, expectedEndDate, durationDays, totalChicks, aliveChicks, deadChicks, mortalityPercentage, status, notes).run();

          return jsonResponse({ id, farm_id: farmId, batchNumber, batchName, breedType, startDate, expectedEndDate, durationDays, totalChicks, aliveChicks, deadChicks, mortalityPercentage, status, notes }, 201, origin);
        }
      }

      if (path.startsWith('/api/batches/')) {
        const id = path.split('/')[3];
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM batches WHERE id = ? AND farm_id = ?').bind(id, farmId).run();
          return jsonResponse({ success: true, id }, 200, origin);
        }
        if (method === 'PATCH' || method === 'PUT') {
          const body: any = await request.json();
          const updates: string[] = [];
          const values: any[] = [];

          for (const [key, val] of Object.entries(body)) {
            updates.push(`${key} = ?`);
            values.push(val);
          }
          values.push(id, farmId);
          await env.DB.prepare(`UPDATE batches SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND farm_id = ?`)
            .bind(...values)
            .run();
          return jsonResponse({ success: true, id }, 200, origin);
        }
      }

      // 5. EXPENSES
      if (path === '/api/expenses') {
        if (method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM expenses WHERE farm_id = ? ORDER BY date DESC, created_at DESC')
            .bind(farmId)
            .all();
          return jsonResponse(results || [], 200, origin);
        }

        if (method === 'POST') {
          const body: any = await request.json();
          const id = body.id || `EXP-${Date.now()}`;
          const category = body.category || 'General';
          const amount = Number(body.amount) || 0;
          const description = body.description || `Expense for ${category}`;
          const date = body.date || new Date().toISOString().split('T')[0];
          const batchId = body.batchId || null;

          await env.DB.prepare(`
            INSERT INTO expenses (id, farm_id, batch_id, category, amount, date, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(id, farmId, batchId, category, amount, date, description).run();

          return jsonResponse({ id, farm_id: farmId, batchId, category, amount, date, description }, 201, origin);
        }
      }

      if (path.startsWith('/api/expenses/')) {
        const id = path.split('/')[3];
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM expenses WHERE id = ? AND farm_id = ?').bind(id, farmId).run();
          return jsonResponse({ success: true, id }, 200, origin);
        }
      }

      // 6. SALES
      if (path === '/api/sales') {
        if (method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM sales WHERE farm_id = ? ORDER BY sale_date DESC, created_at DESC')
            .bind(farmId)
            .all();
          return jsonResponse(results || [], 200, origin);
        }

        if (method === 'POST') {
          const body: any = await request.json();
          const id = body.id || `SALE-${Date.now()}`;
          const batchId = body.batchId || null;
          const chickensSold = Number(body.chickensSold) || 0;
          const averageWeight = Number(body.averageWeight) || 2.2;
          const pricePerKg = Number(body.pricePerKg) || 115;
          const totalRevenue = Number(body.totalRevenue) || (chickensSold * averageWeight * pricePerKg);
          const buyer = body.buyer || 'Wholesale Poultry Market';
          const notes = body.notes || '';
          const saleDate = body.saleDate || new Date().toISOString().split('T')[0];

          await env.DB.prepare(`
            INSERT INTO sales (id, farm_id, batch_id, chickens_sold, average_weight, price_per_kg, total_revenue, buyer, notes, sale_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, farmId, batchId, chickensSold, averageWeight, pricePerKg, totalRevenue, buyer, notes, saleDate).run();

          return jsonResponse({ id, farm_id: farmId, batchId, chickensSold, averageWeight, pricePerKg, totalRevenue, buyer, notes, saleDate }, 201, origin);
        }
      }

      if (path.startsWith('/api/sales/')) {
        const id = path.split('/')[3];
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM sales WHERE id = ? AND farm_id = ?').bind(id, farmId).run();
          return jsonResponse({ success: true, id }, 200, origin);
        }
      }

      // 7. FULL MULTI-DEVICE SYNC
      if (path === '/api/sync') {
        if (method === 'GET') {
          const [batches, expenses, sales, billing, settings, notifications] = await Promise.all([
            env.DB.prepare('SELECT * FROM batches WHERE farm_id = ? ORDER BY created_at DESC').bind(farmId).all(),
            env.DB.prepare('SELECT * FROM expenses WHERE farm_id = ? ORDER BY date DESC').bind(farmId).all(),
            env.DB.prepare('SELECT * FROM sales WHERE farm_id = ? ORDER BY sale_date DESC').bind(farmId).all(),
            env.DB.prepare('SELECT * FROM billing WHERE farm_id = ? ORDER BY date DESC').bind(farmId).all(),
            env.DB.prepare('SELECT * FROM settings WHERE farm_id = ?').bind(farmId).first(),
            env.DB.prepare('SELECT * FROM notifications WHERE farm_id = ? ORDER BY created_at DESC LIMIT 20').bind(farmId).all(),
          ]);

          return jsonResponse({
            batches: batches.results || [],
            expenses: expenses.results || [],
            sales: sales.results || [],
            billingHistory: billing.results || [],
            settings: settings || null,
            notifications: notifications.results || [],
            lastSynced: new Date().toISOString(),
          }, 200, origin);
        }

        if (method === 'POST') {
          const body: any = await request.json();
          // Broadcast sync handler
          return jsonResponse({ success: true, syncedAt: new Date().toISOString() }, 200, origin);
        }
      }

      // 8. RESET FARM DATA
      if (path === '/api/reset' && method === 'POST') {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM daily_records WHERE farm_id = ?').bind(farmId),
          env.DB.prepare('DELETE FROM expenses WHERE farm_id = ?').bind(farmId),
          env.DB.prepare('DELETE FROM sales WHERE farm_id = ?').bind(farmId),
          env.DB.prepare('DELETE FROM billing WHERE farm_id = ?').bind(farmId),
          env.DB.prepare('DELETE FROM batches WHERE farm_id = ?').bind(farmId),
          env.DB.prepare('DELETE FROM notifications WHERE farm_id = ?').bind(farmId),
        ]);
        return jsonResponse({ success: true, message: 'All farm data reset on Cloudflare D1' }, 200, origin);
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404, origin);
    } catch (err: any) {
      return jsonResponse({ error: err.message || 'Internal Server Error' }, 500, origin);
    }
  },
};
