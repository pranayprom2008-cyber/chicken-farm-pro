import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function restoreToDatabase() {
  const prisma = new PrismaClient();

  const masterPath = path.join(process.cwd(), 'backups', 'chicken-farm-recovery-master.json');
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

  console.log('Restoring recovered data into SQLite dev.db...');

  // 1. Restore Batches
  for (const b of master.batches) {
    await prisma.batch.upsert({
      where: { batchNumber: b.batchNumber },
      update: {
        totalChicks: b.totalChicks,
        aliveChicks: b.aliveChicks,
        deadChicks: b.deadChicks,
        status: b.status,
        notes: b.notes,
      },
      create: {
        id: b.id,
        batchNumber: b.batchNumber,
        batchName: b.batchName || 'Flock 1',
        breedType: b.breedType || 'Cobb 500 (Broiler)',
        startDate: new Date(b.startDate),
        expectedEndDate: new Date(b.expectedEndDate),
        actualEndDate: b.actualEndDate ? new Date(b.actualEndDate) : null,
        durationDays: b.durationDays || 45,
        totalChicks: b.totalChicks || 5000,
        aliveChicks: b.aliveChicks || 5000,
        deadChicks: b.deadChicks || 0,
        status: b.status || 'growing',
        notes: b.notes || '',
      },
    });
    console.log(`✓ Batch restored: ${b.batchNumber} (${b.totalChicks} chicks)`);
  }

  // 2. Restore Expenses from Laptop Backup
  for (const exp of master.expenses) {
    await prisma.expense.upsert({
      where: { id: exp.id },
      update: {
        category: exp.category,
        amount: Number(exp.amount),
        description: exp.description,
        date: new Date(exp.date),
      },
      create: {
        id: exp.id,
        category: exp.category || 'Miscellaneous',
        amount: Number(exp.amount),
        description: exp.description,
        date: new Date(exp.date),
        batchId: exp.batchId || null,
      },
    });
    console.log(`✓ Expense restored: ${exp.category} - ₹${exp.amount} ("${exp.description}")`);
  }

  // 3. Restore Billing History
  for (const bill of master.billingHistory) {
    await prisma.billingCalculation.upsert({
      where: { id: bill.id },
      update: {
        totalAmount: Number(bill.totalAmount),
        notes: bill.notes,
      },
      create: {
        id: bill.id,
        type: bill.type,
        chickRate: bill.chickRate !== undefined ? Number(bill.chickRate) : null,
        numberOfChicks: bill.numberOfChicks !== undefined ? Number(bill.numberOfChicks) : null,
        totalAmount: Number(bill.totalAmount),
        notes: bill.notes || '',
        date: new Date(bill.date),
      },
    });
    console.log(`✓ Billing record restored: ${bill.type} - ₹${bill.totalAmount}`);
  }

  console.log('ALL RECOVERED DATA SUCCESSFULLY RESTORED TO DATABASE.');
  await prisma.$disconnect();
}

restoreToDatabase().catch(console.error);
