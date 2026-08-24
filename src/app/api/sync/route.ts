import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [batches, expenses, sales, billingHistory, settings, notifications] = await Promise.all([
      prisma.batch.findMany({ include: { dailyRecords: true }, orderBy: { createdAt: 'desc' } }).catch(() => []),
      prisma.expense.findMany({ orderBy: { date: 'desc' } }).catch(() => []),
      prisma.sales.findMany({ orderBy: { saleDate: 'desc' } }).catch(() => []),
      prisma.billingCalculation.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
      prisma.farm.findFirst().catch(() => null),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    ]);

    const formattedBatches = (batches || []).map((b) => {
      const total = Number(b.totalChicks) || 5000;
      const dead = Number(b.deadChicks) || 0;
      const alive = Number(b.aliveChicks) || Math.max(0, total - dead);
      const mortPct = total > 0 ? Number(((dead / total) * 100).toFixed(2)) : 0;
      const duration = Number(b.durationDays) || 45;

      const startDate = b.startDate ? new Date(b.startDate) : new Date();
      const today = new Date();
      const elapsed = Math.max(1, Math.min(duration, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1));
      const progress = Math.min(100, Math.max(1, Math.round((elapsed / duration) * 100)));

      return {
        id: b.id,
        batchNumber: b.batchNumber,
        batchName: b.batchName || `Batch ${b.batchNumber}`,
        breedType: b.breedType || 'Cobb 500 (Broiler)',
        startDate: b.startDate ? new Date(b.startDate).toISOString() : new Date().toISOString(),
        expectedEndDate: b.expectedEndDate ? new Date(b.expectedEndDate).toISOString() : new Date().toISOString(),
        actualEndDate: b.actualEndDate ? new Date(b.actualEndDate).toISOString() : null,
        durationDays: duration,
        totalChicks: total,
        aliveChicks: alive,
        deadChicks: dead,
        mortalityPercentage: mortPct,
        daysElapsed: elapsed,
        daysRemaining: Math.max(0, duration - elapsed),
        growthProgress: progress,
        status: b.status || 'growing',
        notes: b.notes || '',
        totalExpenditure: 0,
        costPerChick: 0,
        totalRevenue: 0,
        totalChickensSold: 0,
        netProfit: 0,
        profitPerChick: 0,
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      batches: formattedBatches,
      expenses: expenses || [],
      sales: sales || [],
      billingHistory: billingHistory || [],
      settings: settings || null,
      notifications: notifications || [],
      lastSynced: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in sync GET:', error);
    return NextResponse.json({
      batches: [],
      expenses: [],
      sales: [],
      billingHistory: [],
      settings: null,
      notifications: [],
      lastSynced: new Date().toISOString(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
