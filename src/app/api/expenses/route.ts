import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Cloud Database is Single Source of Truth
    const cloudExpenses = await cloudDb.get<any[]>('expenses');
    if (cloudExpenses !== null && Array.isArray(cloudExpenses)) {
      return NextResponse.json(cloudExpenses);
    }

    // 2. First-time initialization only (when key is totally uninitialized)
    try {
      const expenses = await prisma.expense.findMany({
        include: { batch: true },
        orderBy: { date: 'desc' },
      });
      const initialList = Array.isArray(expenses) ? expenses : [];
      await cloudDb.saveExpenses(initialList);
      return NextResponse.json(initialList);
    } catch {
      await cloudDb.saveExpenses([]);
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, description, date, batchId } = body;

    if (!category || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Category and valid positive amount are required.' },
        { status: 400 }
      );
    }

    const newExpense = {
      id: body.id || `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: category || 'Other',
      amount: Number(amount),
      description: description || `Expense for ${category}`,
      date: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      batchId: batchId || null,
      createdAt: new Date().toISOString(),
    };

    // 1. Save directly to Cloud Database
    const currentExpenses = (await cloudDb.get<any[]>('expenses')) || [];
    const updatedExpenses = [newExpense, ...currentExpenses.filter((e) => e.id !== newExpense.id)];
    await cloudDb.saveExpenses(updatedExpenses);

    // 2. Background Prisma write
    try {
      await prisma.expense.create({
        data: {
          id: newExpense.id,
          category: newExpense.category,
          amount: newExpense.amount,
          description: newExpense.description,
          date: new Date(newExpense.date),
          batchId: newExpense.batchId,
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 500 });
  }
}
