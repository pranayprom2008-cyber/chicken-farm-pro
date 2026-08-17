import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

// GET all batches
export async function GET() {
  try {
    // 1. Cloud Database is Single Source of Truth
    const cloudBatches = await cloudDb.get<any[]>('batches');
    if (cloudBatches !== null && Array.isArray(cloudBatches)) {
      return NextResponse.json(cloudBatches);
    }

    // 2. First-time initialization only (when key is totally uninitialized)
    try {
      const batches = await prisma.batch.findMany({
        include: {
          dailyRecords: { orderBy: { date: 'asc' } },
          expenses: true,
          salesRecords: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      const initialList = Array.isArray(batches) ? batches : [];
      await cloudDb.saveBatches(initialList);
      return NextResponse.json(initialList);
    } catch {
      await cloudDb.saveBatches([]);
      return NextResponse.json([]);
    }
  } catch (error: any) {
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
    const mortalityPct = total > 0 ? (dead / total) * 100 : 0;

    const start = startDate ? new Date(startDate) : new Date();
    const expectedEnd = expectedEndDate
      ? new Date(expectedEndDate)
      : new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);

    const newBatch = {
      id: body.id || `BATCH-${Date.now()}`,
      batchNumber: String(batchNumber).trim(),
      batchName: batchName ? String(batchName).trim() : `Batch ${batchNumber}`,
      breedType: breedType || 'Cobb 500 (Broiler)',
      startDate: start.toISOString().split('T')[0],
      expectedEndDate: expectedEnd.toISOString().split('T')[0],
      actualEndDate: null,
      durationDays: duration,
      totalChicks: total,
      aliveChicks: alive,
      deadChicks: dead,
      mortalityPercentage: Number(mortalityPct.toFixed(2)),
      daysElapsed: 1,
      daysRemaining: duration,
      growthProgress: 2,
      status: status || 'growing',
      notes: notes || '',
      totalExpenditure: 0,
      costPerChick: 0,
      totalRevenue: 0,
      totalChickensSold: 0,
      netProfit: 0,
      profitPerChick: 0,
      createdAt: new Date().toISOString(),
    };

    // 1. Save directly to Cloud Database
    const currentBatches = (await cloudDb.get<any[]>('batches')) || [];
    const updatedBatches = [newBatch, ...currentBatches.filter((b) => b.id !== newBatch.id && b.batchNumber !== newBatch.batchNumber)];
    await cloudDb.saveBatches(updatedBatches);

    // 2. Background Prisma write
    try {
      await prisma.batch.create({
        data: {
          id: newBatch.id,
          batchNumber: newBatch.batchNumber,
          batchName: newBatch.batchName,
          breedType: newBatch.breedType,
          startDate: start,
          expectedEndDate: expectedEnd,
          durationDays: duration,
          totalChicks: total,
          aliveChicks: alive,
          deadChicks: dead,
          status: newBatch.status,
          notes: newBatch.notes,
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create batch' }, { status: 500 });
  }
}
