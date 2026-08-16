import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const sales = await prisma.sales.findMany({
      where: batchId && batchId !== 'all' ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { saleDate: 'desc' },
    });

    return NextResponse.json(sales);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sales';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, chickensSold, averageWeight, pricePerKg, totalRevenue, buyer, notes, saleDate } = body;

    const sold = Number(chickensSold);
    const avgW = Number(averageWeight) || 2.2; // default 2.2kg
    const rate = Number(pricePerKg);

    const calculatedRevenue = totalRevenue !== undefined && Number(totalRevenue) > 0
      ? Number(totalRevenue)
      : sold * avgW * rate;

    if (!sold || sold <= 0 || calculatedRevenue <= 0) {
      return NextResponse.json(
        { error: 'Valid number of chickens sold and selling price/revenue are required' },
        { status: 400 }
      );
    }

    const sale = await prisma.sales.create({
      data: {
        batchId: batchId || null,
        chickensSold: sold,
        averageWeight: avgW,
        pricePerKg: rate || calculatedRevenue / (sold * avgW),
        totalRevenue: calculatedRevenue,
        buyer: buyer || 'Wholesale Buyer',
        notes: notes || '',
        saleDate: saleDate ? new Date(saleDate) : new Date(),
      },
    });

    // If batch associated, check if batch is completed
    if (batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: { salesRecords: true },
      });
      if (batch) {
        const totalSold = batch.salesRecords.reduce((s, r) => s + r.chickensSold, 0) + sold;
        if (totalSold >= batch.aliveChicks) {
          await prisma.batch.update({
            where: { id: batchId },
            data: { status: 'completed', actualEndDate: new Date() },
          });
        }
      }
    }

    await prisma.activityLog.create({
      data: {
        action: 'RECORD_SALE',
        details: `Recorded sale of ${sold} chickens for ₹${calculatedRevenue.toLocaleString()}`,
        user: 'Admin',
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record sale';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
