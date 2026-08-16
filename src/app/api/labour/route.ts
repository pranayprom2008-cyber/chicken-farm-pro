import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const labourLogs = await prisma.labour.findMany({
      where: batchId && batchId !== 'all' ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(labourLogs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch labour records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, employeeName, daysWorked = 1, dailyWage, totalCost, date } = body;

    const wage = Number(dailyWage);
    const days = Number(daysWorked) || 1;
    const cost = totalCost !== undefined ? Number(totalCost) : wage * days;

    if (!employeeName || cost <= 0) {
      return NextResponse.json({ error: 'Employee name and valid wage/cost are required' }, { status: 400 });
    }

    const record = await prisma.labour.create({
      data: {
        batchId: batchId || null,
        employeeName,
        daysWorked: days,
        dailyWage: wage || cost / days,
        totalCost: cost,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Also record as Expense in Labour category
    await prisma.expense.create({
      data: {
        batchId: batchId || null,
        category: 'Labour',
        amount: cost,
        description: `Labour: ${employeeName} (${days} days @ ₹${wage}/day)`,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create labour record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
