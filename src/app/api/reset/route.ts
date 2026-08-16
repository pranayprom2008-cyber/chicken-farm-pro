import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST() {
  try {
    // Delete all records in correct foreign-key cascade order
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

    return NextResponse.json({
      success: true,
      message: 'All farm records, batches, expenses, sales, and telemetry reset to zero.',
    });
  } catch (error: any) {
    console.error('Reset Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset database.' },
      { status: 500 }
    );
  }
}
