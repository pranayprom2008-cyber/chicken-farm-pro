import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const logs = await prisma.electricity.findMany({
      where: batchId && batchId !== 'all' ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { billDate: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch electricity records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, billDate, unitsConsumed, amount, notes } = body;

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return NextResponse.json({ error: 'Valid positive bill amount is required' }, { status: 400 });
    }

    const record = await prisma.electricity.create({
      data: {
        batchId: batchId || null,
        billDate: billDate ? new Date(billDate) : new Date(),
        unitsConsumed: Number(unitsConsumed) || 0,
        amount: amt,
        notes: notes || '',
      },
    });

    // Also record as Expense in Electricity category
    await prisma.expense.create({
      data: {
        batchId: batchId || null,
        category: 'Electricity',
        amount: amt,
        description: `Electricity Bill: ${unitsConsumed || 0} Units consumed`,
        date: billDate ? new Date(billDate) : new Date(),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create electricity record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
