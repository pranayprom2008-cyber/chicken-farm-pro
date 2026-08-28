import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const [
      batches,
      expenses,
      sales,
      feed,
      medicine,
      labour,
      electricity,
      maintenance,
      dailyRecords,
      billingCalculations,
      settings,
    ] = await Promise.all([
      prisma.batch.findMany({ include: { dailyRecords: true } }),
      prisma.expense.findMany(),
      prisma.sales.findMany(),
      prisma.feed.findMany(),
      prisma.medicine.findMany(),
      prisma.labour.findMany(),
      prisma.electricity.findMany(),
      prisma.maintenance.findMany(),
      prisma.dailyBatchRecord.findMany(),
      prisma.billingCalculation.findMany(),
      prisma.setting.findFirst(),
    ]);

    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalRevenue = sales.reduce((acc, s) => acc + (s.totalRevenue || 0), 0);

    const backupPayload = {
      app: 'Chicken Farm Pro',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      summary: {
        totalBatches: batches.length,
        totalExpensesCount: expenses.length,
        totalExpenseAmount: totalExpenses,
        totalSalesCount: sales.length,
        totalRevenueAmount: totalRevenue,
      },
      data: {
        batches,
        expenses,
        sales,
        feed,
        medicine,
        labour,
        electricity,
        maintenance,
        dailyRecords,
        billingCalculations,
        settings,
      },
    };

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="chicken_farm_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Backup export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate backup export', details: error.message },
      { status: 500 }
    );
  }
}
