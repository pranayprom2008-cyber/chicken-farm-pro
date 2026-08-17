import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { category, amount, description, date, batchId } = body;

    // 1. Update in Cloud Database
    const currentExpenses = (await cloudDb.get<any[]>('expenses')) || [];
    const updatedExpenses = currentExpenses.map((e) => {
      if (e.id !== id) return e;
      return {
        ...e,
        category: category !== undefined ? category : e.category,
        amount: amount !== undefined ? Number(amount) : e.amount,
        description: description !== undefined ? description : e.description,
        date: date ? new Date(date).toISOString().split('T')[0] : e.date,
        batchId: batchId !== undefined ? batchId || null : e.batchId,
      };
    });
    await cloudDb.saveExpenses(updatedExpenses);

    // 2. Update Prisma
    try {
      await prisma.expense.update({
        where: { id },
        data: {
          category,
          amount: amount !== undefined ? Number(amount) : undefined,
          description,
          date: date ? new Date(date) : undefined,
          batchId: batchId !== undefined ? batchId || null : undefined,
        },
      });
    } catch {
      // ignore
    }

    const updated = updatedExpenses.find((e) => e.id === id) || { id, ...body };
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Erase directly from Cloud Database
    const currentExpenses = (await cloudDb.get<any[]>('expenses')) || [];
    const filteredExpenses = currentExpenses.filter((e) => e.id !== id);
    await cloudDb.saveExpenses(filteredExpenses);

    // 2. Erase from Prisma
    try {
      await prisma.expense.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'Expense deleted across all devices' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete expense' }, { status: 500 });
  }
}
