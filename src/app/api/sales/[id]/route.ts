import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Erase from Cloud Database
    const currentSales = (await cloudDb.get<any[]>('sales')) || [];
    const filteredSales = currentSales.filter((s) => s.id !== id);
    await cloudDb.saveSales(filteredSales);

    // 2. Erase from Prisma
    try {
      await prisma.sales.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'Sale record deleted across all devices' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete sale' }, { status: 500 });
  }
}
