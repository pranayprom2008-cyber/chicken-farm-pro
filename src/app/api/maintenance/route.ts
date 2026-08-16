import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const logs = await prisma.maintenance.findMany({
      where: batchId && batchId !== 'all' ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch maintenance records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, description, amount, date, notes } = body;

    const amt = Number(amount);
    if (!description || !amt || amt <= 0) {
      return NextResponse.json({ error: 'Description and positive amount are required' }, { status: 400 });
    }

    const record = await prisma.maintenance.create({
      data: {
        batchId: batchId || null,
        description,
        amount: amt,
        notes: notes || '',
        date: date ? new Date(date) : new Date(),
      },
    });

    // Also record as Expense in Maintenance category
    await prisma.expense.create({
      data: {
        batchId: batchId || null,
        category: 'Maintenance',
        amount: amt,
        description: `Maintenance: ${description}`,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create maintenance record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
