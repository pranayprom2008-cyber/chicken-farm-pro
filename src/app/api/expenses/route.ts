import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const batchId = searchParams.get('batchId');

    const whereClause: Record<string, unknown> = {};
    if (category && category !== 'all') whereClause.category = category;
    if (batchId && batchId !== 'all') whereClause.batchId = batchId;

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: { batch: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, description, date, batchId } = body;

    if (!category || !amount || Number(amount) <= 0 || !description) {
      return NextResponse.json(
        { error: 'Category, valid positive amount, and description are required.' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        amount: Number(amount),
        description,
        date: date ? new Date(date) : new Date(),
        batchId: batchId || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
