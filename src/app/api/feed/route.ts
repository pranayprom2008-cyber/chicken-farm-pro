import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const feedLogs = await prisma.feed.findMany({
      where: batchId && batchId !== 'all' ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(feedLogs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch feed records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, quantity, price, totalCost, supplier, notes, date } = body;

    const qty = Number(quantity);
    const prc = Number(price);
    const cost = totalCost !== undefined ? Number(totalCost) : qty * prc;

    if (!qty || qty <= 0 || cost <= 0) {
      return NextResponse.json({ error: 'Valid quantity and cost are required' }, { status: 400 });
    }

    const feedRecord = await prisma.feed.create({
      data: {
        batchId: batchId || null,
        quantity: qty,
        price: prc || cost / qty,
        totalCost: cost,
        supplier: supplier || 'Poultry Feed Co.',
        notes: notes || '',
        date: date ? new Date(date) : new Date(),
      },
    });

    // Also record as Expense in Feed category
    await prisma.expense.create({
      data: {
        batchId: batchId || null,
        category: 'Feed',
        amount: cost,
        description: `Feed Purchase: ${qty} kg/bags from ${supplier || 'supplier'}`,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(feedRecord, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create feed record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
