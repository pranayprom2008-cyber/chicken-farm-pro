import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { d1 } from '@/lib/d1Client';

export const dynamic = 'force-dynamic';

// GET all batches from Cloudflare D1 / Database
export async function GET() {
  try {
    // 1. Fetch from D1 / Database
    const batches = await prisma.batch.findMany({
      include: {
        dailyRecords: { orderBy: { date: 'asc' } },
        expenses: true,
        salesRecords: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = (batches || []).map((b) => {
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

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching batches:', error);
    return NextResponse.json([]);
  }
}

// POST create batch
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      batchNumber,
      batchName,
      breedType,
      startDate,
      expectedEndDate,
      durationDays = 45,
      totalChicks,
      deadChicks = 0,
      status = 'growing',
      notes,
    } = body;

    if (!batchNumber) {
      return NextResponse.json({ error: 'Batch Number is required.' }, { status: 400 });
    }

    const total = Number(totalChicks) || 5000;
    const dead = Number(deadChicks) || 0;
    const alive = Math.max(0, total - dead);
    const duration = Number(durationDays) || 45;

    const start = startDate ? new Date(startDate) : new Date();
    const expectedEnd = expectedEndDate
      ? new Date(expectedEndDate)
      : new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);

    const created = await prisma.batch.create({
      data: {
        batchNumber: String(batchNumber).trim(),
        batchName: batchName ? String(batchName).trim() : `Batch ${batchNumber}`,
        breedType: breedType || 'Cobb 500 (Broiler)',
        startDate: start,
        expectedEndDate: expectedEnd,
        durationDays: duration,
        totalChicks: total,
        aliveChicks: alive,
        deadChicks: dead,
        status: status || 'growing',
        notes: notes || '',
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: error.message || 'Failed to create batch' }, { status: 500 });
  }
}
