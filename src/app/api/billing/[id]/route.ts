import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Erase from Cloud Database
    const currentBilling = (await cloudDb.get<any[]>('billing')) || [];
    const filteredBilling = currentBilling.filter((b) => b.id !== id);
    await cloudDb.saveBilling(filteredBilling);

    // 2. Erase from Prisma
    try {
      await prisma.billingCalculation.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'Calculation deleted across all devices' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete calculation' }, { status: 500 });
  }
}
