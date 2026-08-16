import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all batches with relations and computed summary
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: Record<string, unknown> = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { batchNumber: { contains: search } },
        { batchName: { contains: search } },
        { breedType: { contains: search } },
      ];
    }

    const batches = await prisma.batch.findMany({
      where: whereClause,
      include: {
        dailyRecords: { orderBy: { date: 'asc' } },
        expenses: true,
        feedRecords: true,
        medicineRecords: true,
        labourRecords: true,
        electricityLogs: true,
        maintenanceLogs: true,
        salesRecords: true,
        billingLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedBatches = batches.map((b) => {
      const dead = b.deadChicks;
      const total = b.totalChicks;
      const alive = Math.max(0, total - dead);
      const mortalityPct = total > 0 ? (dead / total) * 100 : 0;

      // Expenses summary
      const feedCost = b.feedRecords.reduce((s, f) => s + f.totalCost, 0);
      const medicineCost = b.medicineRecords.reduce((s, m) => s + m.cost, 0);
      const labourCost = b.labourRecords.reduce((s, l) => s + l.totalCost, 0);
      const electricityCost = b.electricityLogs.reduce((s, e) => s + e.amount, 0);
      const maintenanceCost = b.maintenanceLogs.reduce((s, m) => s + m.amount, 0);
      const directExpenses = b.expenses.reduce((s, e) => s + e.amount, 0);

      const totalExpenditure = feedCost + medicineCost + labourCost + electricityCost + maintenanceCost + directExpenses;
      const costPerChick = total > 0 ? totalExpenditure / total : 0;

      // Revenue summary
      const totalRevenue = b.salesRecords.reduce((s, sale) => s + sale.totalRevenue, 0);
      const totalChickensSold = b.salesRecords.reduce((s, sale) => s + sale.chickensSold, 0);
      const netProfit = totalRevenue - totalExpenditure;
      const profitPerChick = totalChickensSold > 0 ? netProfit / totalChickensSold : 0;

      // Days remaining
      const start = new Date(b.startDate);
      const expectedEnd = new Date(b.expectedEndDate);
      const now = new Date();
      const diffMs = expectedEnd.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const totalDays = Math.max(1, Math.ceil((expectedEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const daysElapsed = Math.min(totalDays, Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
      const growthProgress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

      return {
        ...b,
        aliveChicks: alive,
        mortalityPercentage: Number(mortalityPct.toFixed(2)),
        daysRemaining,
        daysElapsed,
        growthProgress,
        totalExpenditure,
        costPerChick: Number(costPerChick.toFixed(2)),
        totalRevenue,
        totalChickensSold,
        netProfit,
        profitPerChick: Number(profitPerChick.toFixed(2)),
        costBreakdown: {
          feed: feedCost,
          medicine: medicineCost,
          labour: labourCost,
          electricity: electricityCost,
          maintenance: maintenanceCost,
          other: directExpenses,
        },
      };
    });

    return NextResponse.json(enrichedBatches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch batches';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create a new batch
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
      totalChicks = 5000,
      deadChicks = 0,
      notes,
      status = 'growing',
    } = body;

    if (!batchNumber) {
      return NextResponse.json({ error: 'Batch Number is required.' }, { status: 400 });
    }

    if (totalChicks <= 0) {
      return NextResponse.json({ error: 'Total chicks must be greater than 0.' }, { status: 400 });
    }

    if (deadChicks < 0 || deadChicks > totalChicks) {
      return NextResponse.json({ error: 'Dead chicks cannot be negative or exceed total chicks.' }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const expectedEnd = expectedEndDate
      ? new Date(expectedEndDate)
      : new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const aliveChicks = totalChicks - deadChicks;

    const newBatch = await prisma.batch.create({
      data: {
        batchNumber: String(batchNumber).trim(),
        batchName: batchName ? String(batchName).trim() : `Batch ${batchNumber}`,
        breedType: breedType || 'Cobb 500 (Broiler)',
        startDate: start,
        expectedEndDate: expectedEnd,
        durationDays: Number(durationDays) || 45,
        totalChicks: Number(totalChicks),
        aliveChicks: Number(aliveChicks),
        deadChicks: Number(deadChicks),
        status: status || 'growing',
        notes: notes || '',
      },
    });

    // Auto-create initial daily batch record
    await prisma.dailyBatchRecord.create({
      data: {
        batchId: newBatch.id,
        date: start,
        aliveChicks: Number(aliveChicks),
        deadChicks: Number(deadChicks),
        feedConsumed: 0,
        averageWeight: 0.045, // Day 1 chick avg 45g
        notes: 'Initial batch placement',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE_BATCH',
        details: `Created batch ${newBatch.batchNumber} with ${totalChicks} chicks`,
        user: 'Admin',
      },
    });

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
