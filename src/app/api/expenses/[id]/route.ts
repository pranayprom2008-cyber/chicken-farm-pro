import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { category, amount, description, date, batchId } = body;

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        category,
        amount: amount !== undefined ? Number(amount) : undefined,
        description,
        date: date ? new Date(date) : undefined,
        batchId: batchId !== undefined ? batchId || null : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Expense deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
