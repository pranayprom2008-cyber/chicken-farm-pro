import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const records = await prisma.dailyBatchRecord.findMany({
      where: batchId ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch daily records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, date, deadChicks = 0, feedConsumed = 0, averageWeight = 0, notes } = body;

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const newDeadTotal = batch.deadChicks + Number(deadChicks);
    const newAlive = Math.max(0, batch.totalChicks - newDeadTotal);

    const recordDate = date ? new Date(date) : new Date();

    const record = await prisma.dailyBatchRecord.create({
      data: {
        batchId,
        date: recordDate,
        aliveChicks: newAlive,
        deadChicks: Number(deadChicks),
        feedConsumed: Number(feedConsumed),
        averageWeight: Number(averageWeight),
        notes: notes || '',
      },
    });

    // Update batch totals if dead chicks reported
    if (Number(deadChicks) > 0) {
      await prisma.batch.update({
        where: { id: batchId },
        data: {
          deadChicks: newDeadTotal,
          aliveChicks: newAlive,
        },
      });
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create daily record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
