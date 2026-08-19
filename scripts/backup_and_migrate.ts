import { cloudDb } from '../src/lib/cloudStore';
import { prisma } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function backupCurrentData() {
  console.log('--- STEP 1: INSPECTING EXISTING DATA SOURCES ---');

  // 1. Fetch Cloud Store Data
  const cloudFarmData = await cloudDb.getFarmData();
  console.log(`Cloud Store Data found:`);
  console.log(`- Batches: ${cloudFarmData.batches.length}`);
  console.log(`- Expenses: ${cloudFarmData.expenses.length}`);
  console.log(`- Sales: ${cloudFarmData.sales.length}`);
  console.log(`- Billing: ${cloudFarmData.billingHistory.length}`);
  console.log(`- Notifications: ${cloudFarmData.notifications.length}`);

  // 2. Fetch Prisma SQLite Data (if any exists locally)
  let prismaBatches: any[] = [];
  let prismaExpenses: any[] = [];
  let prismaSales: any[] = [];
  let prismaBilling: any[] = [];

  try {
    prismaBatches = await prisma.batch.findMany({ include: { dailyRecords: true, expenses: true, salesRecords: true } });
    prismaExpenses = await prisma.expense.findMany();
    prismaSales = await prisma.sales.findMany();
    prismaBilling = await prisma.billingCalculation.findMany();
    console.log(`Prisma SQLite Data found:`);
    console.log(`- Batches: ${prismaBatches.length}`);
    console.log(`- Expenses: ${prismaExpenses.length}`);
    console.log(`- Sales: ${prismaSales.length}`);
    console.log(`- Billing: ${prismaBilling.length}`);
  } catch (e: any) {
    console.log('Prisma inspect notice:', e.message);
  }

  // 3. Merge & Deduplicate uniquely
  const batchMap = new Map<string, any>();
  for (const b of [...prismaBatches, ...cloudFarmData.batches]) {
    if (b && (b.id || b.batchNumber)) {
      const key = b.id || b.batchNumber;
      batchMap.set(key, { ...batchMap.get(key), ...b });
    }
  }

  const expenseMap = new Map<string, any>();
  for (const e of [...prismaExpenses, ...cloudFarmData.expenses]) {
    if (e && e.id) expenseMap.set(e.id, { ...expenseMap.get(e.id), ...e });
  }

  const salesMap = new Map<string, any>();
  for (const s of [...prismaSales, ...cloudFarmData.sales]) {
    if (s && s.id) salesMap.set(s.id, { ...salesMap.get(s.id), ...s });
  }

  const billingMap = new Map<string, any>();
  for (const b of [...prismaBilling, ...cloudFarmData.billingHistory]) {
    if (b && b.id) billingMap.set(b.id, { ...billingMap.get(b.id), ...b });
  }

  const masterBackup = {
    backupTimestamp: new Date().toISOString(),
    version: '1.0.0',
    farm: {
      id: 'farm_main',
      farmName: 'GreenField Poultry Farm',
      location: 'Hyderabad, India',
      ownerName: 'John & Pranay',
      phone: '9502828293',
    },
    users: [
      { id: 'user_john', name: 'John (Farm Lead)', phone: '9502828293', role: 'Admin' },
      { id: 'user_pranay', name: 'Pranay (Co-Founder)', phone: '9849852085', role: 'Admin' },
    ],
    batches: Array.from(batchMap.values()),
    expenses: Array.from(expenseMap.values()),
    sales: Array.from(salesMap.values()),
    billingHistory: Array.from(billingMap.values()),
    notifications: cloudFarmData.notifications || [],
    settings: cloudFarmData.settings || { theme: 'dark', currency: '₹' },
  };

  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `farm_backup_${Date.now()}.json`);
  const masterBackupPath = path.join(backupDir, `farm_backup_latest.json`);

  fs.writeFileSync(backupPath, JSON.stringify(masterBackup, null, 2), 'utf-8');
  fs.writeFileSync(masterBackupPath, JSON.stringify(masterBackup, null, 2), 'utf-8');

  console.log(`\n✅ COMPLETE BACKUP CREATED SUCCESSFULLY!`);
  console.log(`- File 1: ${backupPath}`);
  console.log(`- File 2: ${masterBackupPath}`);
  console.log(`- Backed up Batches: ${masterBackup.batches.length}`);
  console.log(`- Backed up Expenses: ${masterBackup.expenses.length}`);
  console.log(`- Backed up Sales: ${masterBackup.sales.length}`);
  console.log(`- Backed up Billing: ${masterBackup.billingHistory.length}`);

  return masterBackup;
}

backupCurrentData().catch(console.error);
