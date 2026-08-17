import { NextRequest, NextResponse } from 'next/server';
import { cloudDb } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await cloudDb.getFarmData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batches, expenses, sales, billingHistory, settings, notifications } = body;

    const promises = [];
    if (Array.isArray(batches)) promises.push(cloudDb.saveBatches(batches));
    if (Array.isArray(expenses)) promises.push(cloudDb.saveExpenses(expenses));
    if (Array.isArray(sales)) promises.push(cloudDb.saveSales(sales));
    if (Array.isArray(billingHistory)) promises.push(cloudDb.saveBilling(billingHistory));
    if (settings) promises.push(cloudDb.saveSettings(settings));
    if (Array.isArray(notifications)) promises.push(cloudDb.saveNotifications(notifications));

    await Promise.all(promises);

    const updatedData = await cloudDb.getFarmData();
    return NextResponse.json({ success: true, ...updatedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
