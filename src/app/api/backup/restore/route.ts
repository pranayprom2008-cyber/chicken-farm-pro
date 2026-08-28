import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload || !payload.data) {
      return NextResponse.json({ error: 'Invalid backup structure' }, { status: 400 });
    }

    const { data } = payload;
    let restoredCount = 0;

    // Restore Batches
    if (Array.isArray(data.batches)) {
      for (const b of data.batches) {
        await prisma.batch.upsert({
          where: { batchNumber: b.batchNumber },
          update: {
            batchName: b.batchName,
            breedType: b.breedType,
            startDate: new Date(b.startDate),
            expectedEndDate: new Date(b.expectedEndDate),
            actualEndDate: b.actualEndDate ? new Date(b.actualEndDate) : null,
            durationDays: b.durationDays,
            totalChicks: b.totalChicks,
            aliveChicks: b.aliveChicks,
            deadChicks: b.deadChicks,
            status: b.status,
            notes: b.notes,
          },
          create: {
            id: b.id,
            batchNumber: b.batchNumber,
            batchName: b.batchName,
            breedType: b.breedType,
            startDate: new Date(b.startDate),
            expectedEndDate: new Date(b.expectedEndDate),
            actualEndDate: b.actualEndDate ? new Date(b.actualEndDate) : null,
            durationDays: b.durationDays,
            totalChicks: b.totalChicks,
            aliveChicks: b.aliveChicks,
            deadChicks: b.deadChicks,
            status: b.status,
            notes: b.notes,
          },
        });
        restoredCount++;
      }
    }

    // Restore Expenses
    if (Array.isArray(data.expenses)) {
      for (const e of data.expenses) {
        if (e.id) {
          await prisma.expense.upsert({
            where: { id: e.id },
            update: {
              batchId: e.batchId || null,
              category: e.category,
              amount: parseFloat(e.amount),
              date: new Date(e.date),
              description: e.description,
            },
            create: {
              id: e.id,
              batchId: e.batchId || null,
              category: e.category,
              amount: parseFloat(e.amount),
              date: new Date(e.date),
              description: e.description,
            },
          });
          restoredCount++;
        }
      }
    }

    // Restore Sales
    if (Array.isArray(data.sales)) {
      for (const s of data.sales) {
        if (s.id) {
          await prisma.sales.upsert({
            where: { id: s.id },
            update: {
              batchId: s.batchId || null,
              chickensSold: parseInt(s.chickensSold),
              averageWeight: parseFloat(s.averageWeight),
              pricePerKg: parseFloat(s.pricePerKg),
              totalRevenue: parseFloat(s.totalRevenue),
              saleDate: new Date(s.saleDate),
              buyer: s.buyer,
              notes: s.notes,
            },
            create: {
              id: s.id,
              batchId: s.batchId || null,
              chickensSold: parseInt(s.chickensSold),
              averageWeight: parseFloat(s.averageWeight),
              pricePerKg: parseFloat(s.pricePerKg),
              totalRevenue: parseFloat(s.totalRevenue),
              saleDate: new Date(s.saleDate),
              buyer: s.buyer,
              notes: s.notes,
            },
          });
          restoredCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully verified and restored backup data.`,
      restoredRecords: restoredCount,
    });
  } catch (error: any) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup', details: error.message },
      { status: 500 }
    );
  }
}
