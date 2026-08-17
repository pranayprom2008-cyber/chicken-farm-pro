import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentBatches = (await cloudDb.get<any[]>('batches')) || [];
    const batch = currentBatches.find((b) => b.id === id || b.batchNumber === id);
    if (batch) {
      return NextResponse.json(batch);
    }

    const prismaBatch = await prisma.batch.findUnique({
      where: { id },
      include: {
        dailyRecords: true,
        expenses: true,
        salesRecords: true,
      },
    });

    if (!prismaBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json(prismaBatch);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching batch' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Update in Cloud Database
    const currentBatches = (await cloudDb.get<any[]>('batches')) || [];
    const updatedBatches = currentBatches.map((b) => {
      if (b.id !== id && b.batchNumber !== id) return b;
      return { ...b, ...body };
    });
    await cloudDb.saveBatches(updatedBatches);

    // 2. Update Prisma
    try {
      await prisma.batch.update({
        where: { id },
        data: body,
      });
    } catch {
      // ignore
    }

    const updated = updatedBatches.find((b) => b.id === id || b.batchNumber === id) || { id, ...body };
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating batch' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Erase directly from Cloud Database
    const currentBatches = (await cloudDb.get<any[]>('batches')) || [];
    const filteredBatches = currentBatches.filter((b) => b.id !== id && b.batchNumber !== id);
    await cloudDb.saveBatches(filteredBatches);

    // Also erase associated expenses
    const currentExpenses = (await cloudDb.get<any[]>('expenses')) || [];
    const filteredExpenses = currentExpenses.filter((e) => e.batchId !== id);
    await cloudDb.saveExpenses(filteredExpenses);

    // 2. Erase from Prisma
    try {
      await prisma.batch.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'Batch deleted across all devices.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting batch' }, { status: 500 });
  }
}
