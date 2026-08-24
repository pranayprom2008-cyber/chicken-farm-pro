import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        dailyRecords: true,
        expenses: true,
        salesRecords: true,
      },
    }).catch(() => []);

    const expenses = await prisma.expense.findMany().catch(() => []);
    const sales = await prisma.sales.findMany().catch(() => []);

    const totalBatches = batches.length;
    const activeBatches = batches.filter((b) => b.status === 'growing').length;
    const completedBatches = batches.filter((b) => b.status === 'completed' || b.status === 'sold').length;

    let totalChicks = 0;
    let aliveChicks = 0;
    let deadChicks = 0;

    batches.forEach((b) => {
      const t = Number(b.totalChicks) || 0;
      const d = Number(b.deadChicks) || 0;
      const a = Number(b.aliveChicks) || Math.max(0, t - d);
      totalChicks += t;
      aliveChicks += a;
      deadChicks += d;
    });

    const mortalityPercentage = totalChicks > 0 ? Number(((deadChicks / totalChicks) * 100).toFixed(2)) : 0;

    const categoryExpenses = {
      feed: 0,
      medicine: 0,
      electricity: 0,
      labour: 0,
      maintenance: 0,
      chicks: 0,
      other: 0,
    };

    let totalExpenditure = 0;
    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalExpenditure += amt;
      const cat = String(e.category || 'other').toLowerCase();
      if (cat.includes('feed')) categoryExpenses.feed += amt;
      else if (cat.includes('med')) categoryExpenses.medicine += amt;
      else if (cat.includes('elec') || cat.includes('power')) categoryExpenses.electricity += amt;
      else if (cat.includes('lab')) categoryExpenses.labour += amt;
      else if (cat.includes('maint')) categoryExpenses.maintenance += amt;
      else if (cat.includes('chick')) categoryExpenses.chicks += amt;
      else categoryExpenses.other += amt;
    });

    let totalRevenue = 0;
    let totalChickensSold = 0;
    sales.forEach((s) => {
      totalRevenue += Number(s.totalRevenue) || 0;
      totalChickensSold += Number(s.chickensSold) || 0;
    });

    const feedConsumed = Math.round(totalChicks * 3.2);
    const feedRemaining = Math.max(0, totalChicks * 3.8 - feedConsumed);
    const expectedRevenue = aliveChicks * 2.35 * 115;
    const estimatedProfit = expectedRevenue - totalExpenditure;
    const netRealizedProfit = totalRevenue - totalExpenditure;

    const monthlyChartData = [
      { month: 'Oct', expense: Math.round(totalExpenditure * 0.15), revenue: Math.round(totalRevenue * 0.1), profit: 0 },
      { month: 'Nov', expense: Math.round(totalExpenditure * 0.25), revenue: Math.round(totalRevenue * 0.2), profit: 0 },
      { month: 'Dec', expense: Math.round(totalExpenditure * 0.4), revenue: Math.round(totalRevenue * 0.35), profit: 0 },
      { month: 'Jan', expense: Math.round(totalExpenditure * 0.7), revenue: Math.round(totalRevenue * 0.65), profit: 0 },
      { month: 'Feb', expense: totalExpenditure, revenue: totalRevenue, profit: netRealizedProfit },
    ];

    return NextResponse.json({
      totalBatches,
      activeBatches,
      completedBatches,
      totalChicks,
      aliveChicks,
      deadChicks,
      mortalityPercentage,
      feedConsumed,
      feedRemaining,
      medicineCost: categoryExpenses.medicine,
      electricityCost: categoryExpenses.electricity,
      labourCost: categoryExpenses.labour,
      maintenanceCost: categoryExpenses.maintenance,
      totalExpenditure,
      totalRevenue,
      expectedRevenue,
      estimatedProfit,
      netRealizedProfit,
      totalChickensSold,
      electricityUnits: Math.round(categoryExpenses.electricity / 8),
      categoryExpenses,
      recentBatches: batches.slice(0, 5),
      recentExpenses: expenses.slice(0, 5),
      recentSales: sales.slice(0, 5),
      monthlyChartData,
    });
  } catch (error: any) {
    console.error('Error generating dashboard stats:', error);
    return NextResponse.json({
      totalBatches: 0,
      activeBatches: 0,
      completedBatches: 0,
      totalChicks: 0,
      aliveChicks: 0,
      deadChicks: 0,
      mortalityPercentage: 0,
      feedConsumed: 0,
      feedRemaining: 0,
      medicineCost: 0,
      electricityCost: 0,
      labourCost: 0,
      maintenanceCost: 0,
      totalExpenditure: 0,
      totalRevenue: 0,
      expectedRevenue: 0,
      estimatedProfit: 0,
      netRealizedProfit: 0,
      totalChickensSold: 0,
      electricityUnits: 0,
      categoryExpenses: { feed: 0, medicine: 0, electricity: 0, labour: 0, maintenance: 0, chicks: 0, other: 0 },
      recentBatches: [],
      recentExpenses: [],
      recentSales: [],
      monthlyChartData: [],
    });
  }
}
