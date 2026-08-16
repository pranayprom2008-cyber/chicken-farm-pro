import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        dailyRecords: { orderBy: { date: 'asc' } },
        expenses: { orderBy: { date: 'desc' } },
        feedRecords: { orderBy: { date: 'desc' } },
        medicineRecords: { orderBy: { date: 'desc' } },
        labourRecords: { orderBy: { date: 'desc' } },
        electricityLogs: { orderBy: { billDate: 'desc' } },
        maintenanceLogs: { orderBy: { date: 'desc' } },
        salesRecords: { orderBy: { saleDate: 'desc' } },
        billingLogs: { orderBy: { date: 'desc' } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const dead = batch.deadChicks;
    const total = batch.totalChicks;
    const alive = Math.max(0, total - dead);
    const mortalityPct = total > 0 ? (dead / total) * 100 : 0;

    const feedCost = batch.feedRecords.reduce((s, f) => s + f.totalCost, 0);
    const medicineCost = batch.medicineRecords.reduce((s, m) => s + m.cost, 0);
    const labourCost = batch.labourRecords.reduce((s, l) => s + l.totalCost, 0);
    const electricityCost = batch.electricityLogs.reduce((s, e) => s + e.amount, 0);
    const maintenanceCost = batch.maintenanceLogs.reduce((s, m) => s + m.amount, 0);
    const otherCost = batch.expenses.reduce((s, e) => s + e.amount, 0);
    const totalExpenditure = feedCost + medicineCost + labourCost + electricityCost + maintenanceCost + otherCost;

    const totalRevenue = batch.salesRecords.reduce((s, sale) => s + sale.totalRevenue, 0);
    const totalChickensSold = batch.salesRecords.reduce((s, sale) => s + sale.chickensSold, 0);
    const netProfit = totalRevenue - totalExpenditure;

    const start = new Date(batch.startDate);
    const expectedEnd = new Date(batch.expectedEndDate);
    const now = new Date();
    const diffMs = expectedEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const totalDays = Math.max(1, Math.ceil((expectedEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const daysElapsed = Math.min(totalDays, Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
    const growthProgress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

    return NextResponse.json({
      ...batch,
      aliveChicks: alive,
      mortalityPercentage: Number(mortalityPct.toFixed(2)),
      daysRemaining,
      daysElapsed,
      growthProgress,
      totalExpenditure,
      costPerChick: total > 0 ? Number((totalExpenditure / total).toFixed(2)) : 0,
      totalRevenue,
      totalChickensSold,
      netProfit,
      profitPerChick: totalChickensSold > 0 ? Number((netProfit / totalChickensSold).toFixed(2)) : 0,
      costBreakdown: {
        feed: feedCost,
        medicine: medicineCost,
        labour: labourCost,
        electricity: electricityCost,
        maintenance: maintenanceCost,
        other: otherCost,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.batch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const totalChicks = body.totalChicks !== undefined ? Number(body.totalChicks) : existing.totalChicks;
    const deadChicks = body.deadChicks !== undefined ? Number(body.deadChicks) : existing.deadChicks;

    if (totalChicks <= 0) {
      return NextResponse.json({ error: 'Total chicks must be greater than 0.' }, { status: 400 });
    }
    if (deadChicks < 0 || deadChicks > totalChicks) {
      return NextResponse.json({ error: 'Dead chicks cannot be negative or exceed total chicks.' }, { status: 400 });
    }

    const aliveChicks = totalChicks - deadChicks;

    const updated = await prisma.batch.update({
      where: { id },
      data: {
        batchNumber: body.batchNumber !== undefined ? String(body.batchNumber).trim() : existing.batchNumber,
        batchName: body.batchName !== undefined ? String(body.batchName).trim() : existing.batchName,
        breedType: body.breedType !== undefined ? body.breedType : existing.breedType,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : existing.expectedEndDate,
        actualEndDate: body.actualEndDate ? new Date(body.actualEndDate) : existing.actualEndDate,
        durationDays: body.durationDays !== undefined ? Number(body.durationDays) : existing.durationDays,
        totalChicks,
        aliveChicks,
        deadChicks,
        status: body.status !== undefined ? body.status : existing.status,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_BATCH',
        details: `Updated batch ${updated.batchNumber}`,
        user: 'Admin',
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.batch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Cascade deletes handled via relations or manual cleanup
    await prisma.batch.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE_BATCH',
        details: `Deleted batch ${existing.batchNumber}`,
        user: 'Admin',
      },
    });

    return NextResponse.json({ success: true, message: `Batch ${existing.batchNumber} deleted successfully.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
