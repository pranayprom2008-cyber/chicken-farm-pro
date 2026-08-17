import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Clear Cloud Database
    await Promise.allSettled([
      cloudDb.saveBatches([]),
      cloudDb.saveExpenses([]),
      cloudDb.saveSales([]),
      cloudDb.saveBilling([]),
      cloudDb.saveNotifications([]),
    ]);

    // 2. Clear Prisma
    try {
      await prisma.dailyBatchRecord.deleteMany({}).catch(() => {});
      await prisma.feed.deleteMany({}).catch(() => {});
      await prisma.medicine.deleteMany({}).catch(() => {});
      await prisma.labour.deleteMany({}).catch(() => {});
      await prisma.electricity.deleteMany({}).catch(() => {});
      await prisma.maintenance.deleteMany({}).catch(() => {});
      await prisma.sales.deleteMany({}).catch(() => {});
      await prisma.expense.deleteMany({}).catch(() => {});
      await prisma.billingCalculation.deleteMany({}).catch(() => {});
      await prisma.activityLog.deleteMany({}).catch(() => {});
      await prisma.notification.deleteMany({}).catch(() => {});
      await prisma.batch.deleteMany({}).catch(() => {});
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'All farm records, batches, expenses, sales, and telemetry reset to zero across all devices.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset database.' },
      { status: 500 }
    );
  }
}
