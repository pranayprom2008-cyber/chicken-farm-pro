import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cloudSales = await cloudDb.get<any[]>('sales');
    if (cloudSales !== null && Array.isArray(cloudSales)) {
      return NextResponse.json(cloudSales);
    }

    try {
      const sales = await prisma.sales.findMany({
        include: { batch: true },
        orderBy: { saleDate: 'desc' },
      });
      const initialList = Array.isArray(sales) ? sales : [];
      await cloudDb.saveSales(initialList);
      return NextResponse.json(initialList);
    } catch {
      await cloudDb.saveSales([]);
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, chickensSold, averageWeight, pricePerKg, totalRevenue, buyer, notes, saleDate } = body;

    const sold = Number(chickensSold) || 0;
    const avgW = Number(averageWeight) || 2.2;
    const rate = Number(pricePerKg) || 115;
    const calculatedRevenue = Number(totalRevenue) > 0 ? Number(totalRevenue) : sold * avgW * rate;

    const newSale = {
      id: body.id || `SALE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      batchId: batchId || null,
      chickensSold: sold,
      averageWeight: avgW,
      pricePerKg: rate,
      totalRevenue: calculatedRevenue,
      buyer: buyer || 'Wholesale Buyer',
      notes: notes || '',
      saleDate: saleDate ? new Date(saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const currentSales = (await cloudDb.get<any[]>('sales')) || [];
    const updatedSales = [newSale, ...currentSales.filter((s) => s.id !== newSale.id)];
    await cloudDb.saveSales(updatedSales);

    try {
      await prisma.sales.create({
        data: {
          id: newSale.id,
          batchId: newSale.batchId,
          chickensSold: newSale.chickensSold,
          averageWeight: newSale.averageWeight,
          pricePerKg: newSale.pricePerKg,
          totalRevenue: newSale.totalRevenue,
          buyer: newSale.buyer,
          notes: newSale.notes,
          saleDate: new Date(newSale.saleDate),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json(newSale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create sale' }, { status: 500 });
  }
}
