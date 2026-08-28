import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all expenses from database
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(expenses || []);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json([]);
  }
}

// POST create expense
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, description, date, batchId } = body;

    if (!description || !amount) {
      return NextResponse.json({ error: 'Description and amount are required.' }, { status: 400 });
    }

    const created = await prisma.expense.create({
      data: {
        category: category || 'Miscellaneous',
        amount: Number(amount) || 0,
        description: String(description).trim(),
        date: date ? new Date(date) : new Date(),
        batchId: batchId || null,
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 500 });
  }
}
