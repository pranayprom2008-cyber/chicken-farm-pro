import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const batchId = searchParams.get('batchId');

    const whereClause: Record<string, unknown> = {};
    if (type && type !== 'all') whereClause.type = type;
    if (batchId && batchId !== 'all') whereClause.batchId = batchId;

    const calculations = await prisma.billingCalculation.findMany({
      where: whereClause,
      include: { batch: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(calculations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch billing calculations';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type = 'chick_purchase',
      chickRate,
      numberOfChicks,
      feedBags,
      fcrScore,
      totalAmount,
      notes,
      batchId,
      date,
    } = body;

    const amt = Number(totalAmount);
    if (isNaN(amt) || amt < 0) {
      return NextResponse.json({ error: 'Valid total amount is required' }, { status: 400 });
    }

    const calcRecord = await prisma.billingCalculation.create({
      data: {
        type,
        chickRate: chickRate !== undefined ? Number(chickRate) : null,
        numberOfChicks: numberOfChicks !== undefined ? Number(numberOfChicks) : null,
        feedBags: feedBags !== undefined ? Number(feedBags) : null,
        fcrScore: fcrScore !== undefined ? Number(fcrScore) : null,
        totalAmount: amt,
        notes: notes || '',
        batchId: batchId || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'BILLING_CALCULATION_SAVED',
        details: `Saved ${type} calculation for ₹${amt.toLocaleString()}`,
        user: 'Admin',
      },
    });

    return NextResponse.json(calcRecord, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save calculation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
