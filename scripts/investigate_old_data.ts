import { PrismaClient } from '@prisma/client';
import { cloudDb } from '../src/lib/cloudStore';
import fs from 'fs';
import path from 'path';

async function investigate() {
  const report: any = {
    timestamp: new Date().toISOString(),
    sources: {},
  };

  // 1. Check Upstash Redis via cloudDb
  try {
    console.log('Querying Upstash Redis via cloudDb...');
    const farmData = await cloudDb.getFarmData();
    report.sources.upstashRedis = {
      accessible: true,
      batchCount: farmData.batches?.length || 0,
      expenseCount: farmData.expenses?.length || 0,
      salesCount: farmData.sales?.length || 0,
      billingCount: farmData.billingHistory?.length || 0,
      data: farmData,
    };
  } catch (err: any) {
    report.sources.upstashRedis = { accessible: false, error: err.message };
  }

  // 2. Check Prisma SQLite (dev.db)
  try {
    console.log('Querying Prisma SQLite dev.db...');
    const prisma = new PrismaClient();
    const batches = await prisma.batch.findMany({
      include: {
        dailyRecords: true,
        expenses: true,
        salesRecords: true,
        billingLogs: true,
        feedRecords: true,
        medicineRecords: true,
        labourRecords: true,
        electricityLogs: true,
        maintenanceLogs: true,
      },
    }).catch(() => []);
    const expenses = await prisma.expense.findMany().catch(() => []);
    const sales = await prisma.sales.findMany().catch(() => []);
    const billing = await prisma.billingCalculation.findMany().catch(() => []);
    const dailyRecords = await prisma.dailyBatchRecord.findMany().catch(() => []);
    const feeds = await prisma.feed.findMany().catch(() => []);
    const medicines = await prisma.medicine.findMany().catch(() => []);
    const labours = await prisma.labour.findMany().catch(() => []);
    const electricities = await prisma.electricity.findMany().catch(() => []);
    const maintenances = await prisma.maintenance.findMany().catch(() => []);
    const farms = await prisma.farm.findMany().catch(() => []);
    const users = await prisma.user.findMany().catch(() => []);

    report.sources.prismaSqlite = {
      accessible: true,
      batchCount: batches.length,
      expenseCount: expenses.length,
      salesCount: sales.length,
      billingCount: billing.length,
      dailyRecordCount: dailyRecords.length,
      feedCount: feeds.length,
      medicineCount: medicines.length,
      labourCount: labours.length,
      electricityCount: electricities.length,
      maintenanceCount: maintenances.length,
      farmCount: farms.length,
      userCount: users.length,
      data: {
        batches,
        expenses,
        sales,
        billing,
        dailyRecords,
        feeds,
        medicines,
        labours,
        electricities,
        maintenances,
        farms,
        users,
      },
    };
    await prisma.$disconnect();
  } catch (err: any) {
    report.sources.prismaSqlite = { accessible: false, error: err.message };
  }

  // 3. Check Backups Directory
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json') && f.startsWith('farm_backup'));
      report.sources.backupFiles = [];
      for (const f of files) {
        const fullPath = path.join(backupDir, f);
        const stats = fs.statSync(fullPath);
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        report.sources.backupFiles.push({
          fileName: f,
          size: stats.size,
          createdAt: stats.birthtime,
          batches: content.batches?.length || 0,
          expenses: content.expenses?.length || 0,
          sales: content.sales?.length || 0,
          billing: content.billingHistory?.length || content.billing?.length || 0,
          content,
        });
      }
    }
  } catch (err: any) {
    report.sources.backupFiles = { error: err.message };
  }

  // 4. Save Comprehensive Investigation Export
  const exportPath = path.join(process.cwd(), 'backups', 'comprehensive_recovery_investigation.json');
  fs.writeFileSync(exportPath, JSON.stringify(report, null, 2));

  console.log('=== COMPREHENSIVE INVESTIGATION RESULTS ===');
  console.log('Upstash Redis Batches:', report.sources.upstashRedis?.batchCount, 'Expenses:', report.sources.upstashRedis?.expenseCount);
  console.log('Prisma SQLite Batches:', report.sources.prismaSqlite?.batchCount, 'Expenses:', report.sources.prismaSqlite?.expenseCount, 'Sales:', report.sources.prismaSqlite?.salesCount, 'Billing:', report.sources.prismaSqlite?.billingCount);
  if (Array.isArray(report.sources.backupFiles)) {
    for (const b of report.sources.backupFiles) {
      console.log(`Backup [${b.fileName}]: Batches=${b.batches}, Expenses=${b.expenses}, Billing=${b.billing}`);
    }
  }
}

investigate().catch(console.error);
