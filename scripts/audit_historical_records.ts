import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

async function runAudit() {
  console.log('=== COMPREHENSIVE HISTORICAL RECORD AUDIT ===\n');

  // 1. Laptop Backup
  const laptopPath = 'C:\\Users\\prana\\Downloads\\ChickFarm_Pro_Backup_2026-08-17.json';
  if (fs.existsSync(laptopPath)) {
    const data = JSON.parse(fs.readFileSync(laptopPath, 'utf8'));
    console.log('1. LAPTOP DOWNLOADS BACKUP:');
    console.log('File:', laptopPath);
    console.log('Saved Timestamp:', data.timestamp);
    console.log('Farm Name:', data.farmName);
    console.log('Expenses:', data.data?.expenses);
  }

  // 2. Local Database State
  const prisma = new PrismaClient();
  const batches = await prisma.batch.findMany();
  const expenses = await prisma.expense.findMany();
  const billing = await prisma.billingCalculation.findMany();
  const sales = await prisma.sales.findMany();
  const feeds = await prisma.feed.findMany();
  const medicines = await prisma.medicine.findMany();
  const labours = await prisma.labour.findMany();
  const electricities = await prisma.electricity.findMany();
  const maintenances = await prisma.maintenance.findMany();

  console.log('\n2. CURRENT SQLITE DEV.DB DATA:');
  console.log('Batches in DB:', batches);
  console.log('Expenses in DB:', expenses);
  console.log('Billing in DB:', billing);
  console.log('Sales in DB:', sales);
  console.log('Feeds in DB:', feeds);
  console.log('Medicines in DB:', medicines);
  console.log('Labours in DB:', labours);
  console.log('Electricities in DB:', electricities);
  console.log('Maintenances in DB:', maintenances);

  // 3. Historical Git Seed Records (Commit 6b2b37b)
  console.log('\n3. HISTORICAL GIT COMMIT 6b2b37b SEED RECORDS:');
  const gitRecords = [
    { type: 'Feed', supplier: 'Godrej Agrovet Feed (120 bags)', amount: 258000 },
    { type: 'Feed', supplier: 'Suguna Feeds Ltd. (160 bags)', amount: 328000 },
    { type: 'Medicine', supplier: 'Newcastle Disease LaSota Vaccine', amount: 3800 },
    { type: 'Labour', supplier: 'Ramesh Kumar (Supervisor 28 days)', amount: 16800 },
    { type: 'Electricity', supplier: 'Tunnel ventilation (1850 units)', amount: 14800 },
    { type: 'Maintenance', supplier: 'Nipple drinker sanitization', amount: 4500 },
    { type: 'Chick Placement Billing', supplier: '5000 Day-old chicks @ ₹38', amount: 190000 },
  ];
  const gitTotal = gitRecords.reduce((sum, r) => sum + r.amount, 0);
  console.log('Itemized items:', gitRecords);
  console.log(`TOTAL GIT HISTORICAL EXPENSE/PLACEMENT BASELINE: ₹${gitTotal.toLocaleString()} (~₹8.16 Lakhs)`);

  await prisma.$disconnect();
}

runAudit().catch(console.error);
