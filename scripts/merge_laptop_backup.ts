import fs from 'fs';
import path from 'path';

async function mergeAllBackups() {
  const laptopBackupPath = 'C:\\Users\\prana\\Downloads\\ChickFarm_Pro_Backup_2026-08-17.json';
  let laptopBackup: any = null;
  if (fs.existsSync(laptopBackupPath)) {
    laptopBackup = JSON.parse(fs.readFileSync(laptopBackupPath, 'utf8'));
  }

  const dbBackupPath = path.join(process.cwd(), 'backups', 'farm_backup_latest.json');
  let dbBackup: any = null;
  if (fs.existsSync(dbBackupPath)) {
    dbBackup = JSON.parse(fs.readFileSync(dbBackupPath, 'utf8'));
  }

  const combinedRecovery = {
    recoveryTimestamp: new Date().toISOString(),
    version: '1.0.0-UNIFIED-MASTER',
    sources: [
      'Laptop Downloads: C:\\Users\\prana\\Downloads\\ChickFarm_Pro_Backup_2026-08-17.json',
      'SQLite dev.db / backups/farm_backup_latest.json',
      'Git History (Commit 6b2b37b)',
    ],
    farm: dbBackup?.farm || {
      farmName: 'GreenField Bio-Secure Poultry Farm',
      location: 'Hyderabad, India',
      ownerName: 'Venkata Farms',
      phone: '9502828293',
    },
    batches: dbBackup?.batches || [
      {
        id: 'cmsvnoyxk000f7dwn6aaisw0t',
        batchNumber: 'B-2026-01',
        batchName: 'Flock 1',
        breedType: 'Cobb 500 (Broiler)',
        startDate: '2026-08-16T00:00:00.000Z',
        expectedEndDate: '2026-09-30T00:00:00.000Z',
        actualEndDate: null,
        durationDays: 45,
        totalChicks: 5000,
        aliveChicks: 5000,
        deadChicks: 0,
        mortalityPercentage: 0,
        status: 'growing',
        notes: 'Test Flock',
      },
    ],
    expenses: [
      ...(laptopBackup?.data?.expenses || []),
    ],
    billingHistory: dbBackup?.billingHistory || [
      {
        id: 'cmsvns8r0000k7dwn5cixnao6',
        batchId: null,
        type: 'chick_purchase',
        chickRate: 222,
        numberOfChicks: 15,
        totalAmount: 3330,
        notes: 'Chick Purchase: 15 birds @ ₹222/unit',
        date: '2026-08-16T10:25:15.851Z',
      },
    ],
    sales: dbBackup?.sales || [],
    settings: laptopBackup?.data?.settings || dbBackup?.settings || {
      farmName: 'GreenField Bio-Secure Poultry Farm',
      currency: '₹',
      language: 'en',
      theme: 'dark',
      location: 'Hyderabad, India',
      ownerName: 'Venkata Farms',
    },
  };

  const masterPath = path.join(process.cwd(), 'backups', 'chicken-farm-recovery-master.json');
  fs.writeFileSync(masterPath, JSON.stringify(combinedRecovery, null, 2));

  console.log('UNIFIED MASTER RECOVERY GENERATED:');
  console.log('Batches:', combinedRecovery.batches.length);
  console.log('Expenses:', combinedRecovery.expenses.length, combinedRecovery.expenses);
  console.log('Billing Records:', combinedRecovery.billingHistory.length, combinedRecovery.billingHistory);
  console.log('Saved to:', masterPath);
}

mergeAllBackups().catch(console.error);
