import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const medicineLogs = await prisma.medicine.findMany({
      where: batchId && batchId !== 'all' ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(medicineLogs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch medicine records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, medicineName, quantity, cost, purpose, notes, date } = body;

    const medCost = Number(cost);
    if (!medicineName || medCost <= 0) {
      return NextResponse.json({ error: 'Medicine name and positive cost are required' }, { status: 400 });
    }

    const record = await prisma.medicine.create({
      data: {
        batchId: batchId || null,
        medicineName,
        quantity: Number(quantity) || 1,
        cost: medCost,
        purpose: purpose || 'Vaccination / Immunity Boost',
        notes: notes || '',
        date: date ? new Date(date) : new Date(),
      },
    });

    // Also record as Expense in Medicine category
    await prisma.expense.create({
      data: {
        batchId: batchId || null,
        category: 'Medicine',
        amount: medCost,
        description: `Medicine: ${medicineName} (${purpose || 'Treatment'})`,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create medicine record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
