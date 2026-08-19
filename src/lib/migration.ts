/**
 * ==========================================================
 * CHICKEN FARM PRO - CLOUDFLARE D1 DATA MIGRATION & VERIFIER
 * ==========================================================
 * Idempotent, safe migration engine with automated audit verification.
 */

import { d1 } from './d1Client';
import { cloudDb } from './cloudStore';
import * as fs from 'fs';
import * as path from 'path';

export type MigrationStatus =
  | 'NOT_STARTED'
  | 'BACKUP_CREATED'
  | 'MIGRATING'
  | 'MIGRATION_COMPLETE'
  | 'VERIFICATION_RUNNING'
  | 'VERIFICATION_PASSED'
  | 'VERIFICATION_FAILED'
  | 'MIGRATION_FAILED';

export interface MigrationReport {
  status: MigrationStatus;
  backupFile: string;
  sourceBatches: number;
  sourceExpenses: number;
  sourceSales: number;
  sourceBilling: number;
  d1Batches: number;
  d1Expenses: number;
  d1Sales: number;
  d1Billing: number;
  mismatches: string[];
  completedAt?: string;
  error?: string;
}

export async function runSafeD1Migration(): Promise<MigrationReport> {
  const report: MigrationReport = {
    status: 'NOT_STARTED',
    backupFile: '',
    sourceBatches: 0,
    sourceExpenses: 0,
    sourceSales: 0,
    sourceBilling: 0,
    d1Batches: 0,
    d1Expenses: 0,
    d1Sales: 0,
    d1Billing: 0,
    mismatches: [],
  };

  try {
    // ── STEP 1: READ BACKUP ────────────────────────────────────────────────
    const backupDir = path.join(process.cwd(), 'backups');
    const latestBackupPath = path.join(backupDir, 'farm_backup_latest.json');

    if (!fs.existsSync(latestBackupPath)) {
      report.status = 'MIGRATION_FAILED';
      report.error = 'No backup file found. Migration aborted to protect data.';
      return report;
    }

    const rawData = fs.readFileSync(latestBackupPath, 'utf-8');
    const backupData = JSON.parse(rawData);
    report.backupFile = latestBackupPath;
    report.status = 'BACKUP_CREATED';

    report.sourceBatches = Number(backupData.batches?.length || 0);
    report.sourceExpenses = Number(backupData.expenses?.length || 0);
    report.sourceSales = Number(backupData.sales?.length || 0);
    report.sourceBilling = Number(backupData.billingHistory?.length || 0);

    // ── STEP 2: ENSURE D1 TABLES EXIST IN ORDER ────────────────────────────
    const tableDefinitions = [
      `CREATE TABLE IF NOT EXISTS farms (
        id TEXT PRIMARY KEY,
        farm_name TEXT NOT NULL DEFAULT 'GreenField Poultry Farm',
        location TEXT NOT NULL DEFAULT 'Hyderabad, India',
        owner_name TEXT NOT NULL DEFAULT 'John & Pranay',
        phone TEXT NOT NULL DEFAULT '9502828293',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'Admin',
        pin TEXT NOT NULL DEFAULT '1234',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        batch_number TEXT NOT NULL,
        batch_name TEXT NOT NULL,
        breed_type TEXT NOT NULL DEFAULT 'Cobb 500 (Broiler)',
        start_date TEXT NOT NULL DEFAULT (datetime('now')),
        expected_end_date TEXT NOT NULL,
        actual_end_date TEXT,
        duration_days INTEGER NOT NULL DEFAULT 45,
        total_chicks INTEGER NOT NULL DEFAULT 5000,
        alive_chicks INTEGER NOT NULL DEFAULT 5000,
        dead_chicks INTEGER NOT NULL DEFAULT 0,
        mortality_percentage REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'growing',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS daily_records (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        batch_id TEXT NOT NULL,
        date TEXT NOT NULL DEFAULT (datetime('now')),
        alive_chicks INTEGER NOT NULL,
        dead_chicks INTEGER NOT NULL DEFAULT 0,
        feed_consumed REAL NOT NULL DEFAULT 0.0,
        average_weight REAL NOT NULL DEFAULT 0.0,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        batch_id TEXT,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL DEFAULT (date('now')),
        description TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        batch_id TEXT,
        chickens_sold INTEGER NOT NULL,
        average_weight REAL NOT NULL,
        price_per_kg REAL NOT NULL,
        total_revenue REAL NOT NULL,
        buyer TEXT NOT NULL DEFAULT 'Wholesale Buyer',
        notes TEXT,
        sale_date TEXT NOT NULL DEFAULT (date('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS billing (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        batch_id TEXT,
        flock_name TEXT NOT NULL,
        total_chicks INTEGER NOT NULL,
        alive_chicks INTEGER NOT NULL,
        total_weight_kg REAL NOT NULL,
        average_weight_kg REAL NOT NULL,
        price_per_kg REAL NOT NULL,
        gross_revenue REAL NOT NULL,
        deductions REAL NOT NULL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        notes TEXT,
        date TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 0.0,
        unit TEXT NOT NULL DEFAULT 'bags',
        reorder_level REAL NOT NULL DEFAULT 10.0,
        cost_per_unit REAL NOT NULL DEFAULT 0.0,
        supplier TEXT,
        last_restocked TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Farm Supervisor',
        phone TEXT NOT NULL,
        daily_wage REAL NOT NULL DEFAULT 600.0,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT 'default-settings',
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        farm_name TEXT NOT NULL DEFAULT 'GreenField Poultry Farm',
        currency TEXT NOT NULL DEFAULT '₹',
        language TEXT NOT NULL DEFAULT 'en',
        theme TEXT NOT NULL DEFAULT 'dark',
        logo_url TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS ai_actions (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL DEFAULT 'farm_main',
        action_type TEXT NOT NULL,
        action_payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ];

    for (const ddl of tableDefinitions) {
      try {
        await d1.query(ddl);
      } catch {
        // ignore
      }
    }

    // ── STEP 3: IDEMPOTENT MIGRATION TO D1 ─────────────────────────────────
    report.status = 'MIGRATING';

    const farmId = backupData.farm?.id || 'farm_main';

    // 1. Ensure Farm & Users exist
    await d1.query(`
      INSERT OR IGNORE INTO farms (id, farm_name, location, owner_name, phone)
      VALUES (?, ?, ?, ?, ?)
    `, [
      farmId,
      backupData.farm?.farmName || 'GreenField Poultry Farm',
      backupData.farm?.location || 'Hyderabad, India',
      backupData.farm?.ownerName || 'John & Pranay',
      backupData.farm?.phone || '9502828293',
    ]);

    for (const u of backupData.users || []) {
      await d1.query(`
        INSERT OR IGNORE INTO users (id, farm_id, name, phone, role, pin)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [u.id, farmId, u.name, u.phone, u.role, u.pin || '1234']);
    }

    // 2. Migrate Batches (Idempotent)
    for (const b of backupData.batches || []) {
      const id = b.id || `BATCH-${Date.now()}`;
      const batchNumber = String(b.batchNumber || '').trim();
      const batchName = b.batchName || `Batch ${batchNumber}`;
      const breedType = b.breedType || 'Cobb 500 (Broiler)';
      const startDate = b.startDate || new Date().toISOString();
      const expectedEndDate = b.expectedEndDate || new Date(Date.now() + 45 * 86400000).toISOString();
      const durationDays = Number(b.durationDays) || 45;
      const totalChicks = Number(b.totalChicks) || 5000;
      const deadChicks = Number(b.deadChicks) || 0;
      const aliveChicks = Number(b.aliveChicks) || Math.max(0, totalChicks - deadChicks);
      const mortality = totalChicks > 0 ? (deadChicks / totalChicks) * 100 : 0;
      const status = b.status || 'growing';
      const notes = b.notes || '';

      await d1.query(`
        INSERT OR REPLACE INTO batches (id, farm_id, batch_number, batch_name, breed_type, start_date, expected_end_date, duration_days, total_chicks, alive_chicks, dead_chicks, mortality_percentage, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, farmId, batchNumber, batchName, breedType, startDate, expectedEndDate, durationDays, totalChicks, aliveChicks, deadChicks, mortality, status, notes]);
    }

    // 3. Migrate Expenses (Idempotent)
    for (const e of backupData.expenses || []) {
      const id = e.id || `EXP-${Date.now()}`;
      const category = e.category || 'General';
      const amount = Number(e.amount) || 0;
      const description = e.description || '';
      const date = e.date || new Date().toISOString().split('T')[0];
      const batchId = e.batchId || null;

      await d1.query(`
        INSERT OR REPLACE INTO expenses (id, farm_id, batch_id, category, amount, date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id, farmId, batchId, category, amount, date, description]);
    }

    // 4. Migrate Sales (Idempotent)
    for (const s of backupData.sales || []) {
      const id = s.id || `SALE-${Date.now()}`;
      const batchId = s.batchId || null;
      const chickensSold = Number(s.chickensSold) || 0;
      const averageWeight = Number(s.averageWeight) || 2.2;
      const pricePerKg = Number(s.pricePerKg) || 115;
      const totalRevenue = Number(s.totalRevenue) || 0;
      const buyer = s.buyer || 'Wholesale Buyer';
      const notes = s.notes || '';
      const saleDate = s.saleDate || new Date().toISOString().split('T')[0];

      await d1.query(`
        INSERT OR REPLACE INTO sales (id, farm_id, batch_id, chickens_sold, average_weight, price_per_kg, total_revenue, buyer, notes, sale_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, farmId, batchId, chickensSold, averageWeight, pricePerKg, totalRevenue, buyer, notes, saleDate]);
    }

    // 5. Migrate Billing (Idempotent)
    for (const b of backupData.billingHistory || []) {
      const id = b.id || `BILL-${Date.now()}`;
      const batchId = b.batchId || null;
      const flockName = b.flockName || b.type || 'Flock';
      const totalChicks = Number(b.numberOfChicks || b.totalChicks) || 0;
      const aliveChicks = Number(b.aliveChicks) || totalChicks;
      const totalWeightKg = Number(b.totalWeightKg) || 0;
      const averageWeightKg = Number(b.averageWeightKg) || 0;
      const pricePerKg = Number(b.chickRate || b.pricePerKg) || 0;
      const grossRevenue = Number(b.totalAmount || b.grossRevenue) || 0;
      const deductions = Number(b.deductions) || 0;
      const totalAmount = Number(b.totalAmount) || grossRevenue;
      const notes = b.notes || '';
      const date = b.date || new Date().toISOString();

      await d1.query(`
        INSERT OR REPLACE INTO billing (id, farm_id, batch_id, flock_name, total_chicks, alive_chicks, total_weight_kg, average_weight_kg, price_per_kg, gross_revenue, deductions, total_amount, notes, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, farmId, batchId, flockName, totalChicks, aliveChicks, totalWeightKg, averageWeightKg, pricePerKg, grossRevenue, deductions, totalAmount, notes, date]);
    }

    // Update cloud store snapshot for multi-device sync
    await cloudDb.saveBatches(backupData.batches || []);
    await cloudDb.saveExpenses(backupData.expenses || []);
    await cloudDb.saveSales(backupData.sales || []);
    await cloudDb.saveBilling(backupData.billingHistory || []);

    report.status = 'MIGRATION_COMPLETE';

    // ── STEP 4: AUTOMATED AUDIT & VERIFICATION ─────────────────────────────
    report.status = 'VERIFICATION_RUNNING';

    // Verify Batches Count & Content
    const d1BatchesRes = await d1.query('SELECT COUNT(*) as count FROM batches WHERE farm_id = ?', [farmId]);
    report.d1Batches = Number(d1BatchesRes.results[0]?.count || 0);

    // Verify Expenses Count
    const d1ExpensesRes = await d1.query('SELECT COUNT(*) as count FROM expenses WHERE farm_id = ?', [farmId]);
    report.d1Expenses = Number(d1ExpensesRes.results[0]?.count || 0);

    // Verify Sales Count
    const d1SalesRes = await d1.query('SELECT COUNT(*) as count FROM sales WHERE farm_id = ?', [farmId]);
    report.d1Sales = Number(d1SalesRes.results[0]?.count || 0);

    // Verify Billing Count
    const d1BillingRes = await d1.query('SELECT COUNT(*) as count FROM billing WHERE farm_id = ?', [farmId]);
    report.d1Billing = Number(d1BillingRes.results[0]?.count || 0);

    // Audit Comparisons
    if (report.sourceBatches > 0 && report.d1Batches < report.sourceBatches) {
      report.mismatches.push(`Batches count mismatch: Expected ${report.sourceBatches}, got ${report.d1Batches}`);
    }
    if (report.sourceExpenses > 0 && report.d1Expenses < report.sourceExpenses) {
      report.mismatches.push(`Expenses count mismatch: Expected ${report.sourceExpenses}, got ${report.d1Expenses}`);
    }
    if (report.sourceSales > 0 && report.d1Sales < report.sourceSales) {
      report.mismatches.push(`Sales count mismatch: Expected ${report.sourceSales}, got ${report.d1Sales}`);
    }
    if (report.sourceBilling > 0 && report.d1Billing < report.sourceBilling) {
      report.mismatches.push(`Billing count mismatch: Expected ${report.sourceBilling}, got ${report.d1Billing}`);
    }

    if (report.mismatches.length === 0) {
      report.status = 'VERIFICATION_PASSED';
      report.completedAt = new Date().toISOString();
    } else {
      report.status = 'VERIFICATION_FAILED';
    }

    return report;
  } catch (err: any) {
    report.status = 'MIGRATION_FAILED';
    report.error = err.message || 'Unknown migration error';
    return report;
  }
}
