import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Total & Active Batches
    const totalBatches = await prisma.batch.count();
    const activeBatchesCount = await prisma.batch.count({ where: { status: 'growing' } });
    const completedBatchesCount = await prisma.batch.count({ where: { status: 'completed' } });

    // 2. Chick counts from Batches
    const batchAggregations = await prisma.batch.aggregate({
      _sum: {
        totalChicks: true,
        aliveChicks: true,
        deadChicks: true,
      },
    });

    const totalChicks = batchAggregations._sum.totalChicks || 0;
    const aliveChicks = batchAggregations._sum.aliveChicks || 0;
    const deadChicks = batchAggregations._sum.deadChicks || 0;
    const mortalityPercentage = totalChicks > 0 ? Number(((deadChicks / totalChicks) * 100).toFixed(2)) : 0;

    // 3. Category Cost Aggregations
    const feedAgg = await prisma.feed.aggregate({ _sum: { totalCost: true, quantity: true } });
    const feedCost = feedAgg._sum.totalCost || 0;
    const feedTotalQuantity = feedAgg._sum.quantity || 0;

    const medAgg = await prisma.medicine.aggregate({ _sum: { cost: true } });
    const medicineCost = medAgg._sum.cost || 0;

    const elecAgg = await prisma.electricity.aggregate({ _sum: { amount: true, unitsConsumed: true } });
    const electricityCost = elecAgg._sum.amount || 0;
    const electricityUnits = elecAgg._sum.unitsConsumed || 0;

    const labourAgg = await prisma.labour.aggregate({ _sum: { totalCost: true } });
    const labourCost = labourAgg._sum.totalCost || 0;

    const maintAgg = await prisma.maintenance.aggregate({ _sum: { amount: true } });
    const maintenanceCost = maintAgg._sum.amount || 0;

    const expenseAgg = await prisma.expense.aggregate({ _sum: { amount: true } });
    const directExpenses = expenseAgg._sum.amount || 0;

    // If expenses table has records, check if total expenditure is from expenses or module sums
    const totalExpenditure = directExpenses > 0 ? directExpenses : (feedCost + medicineCost + electricityCost + labourCost + maintenanceCost);

    // 4. Feed Consumed from Daily Batch Records
    const dailyFeedAgg = await prisma.dailyBatchRecord.aggregate({ _sum: { feedConsumed: true } });
    const feedConsumed = dailyFeedAgg._sum.feedConsumed || 0;
    const feedRemaining = Math.max(0, feedTotalQuantity - feedConsumed);

    // 5. Sales & Revenue
    const salesAgg = await prisma.sales.aggregate({
      _sum: {
        chickensSold: true,
        totalRevenue: true,
      },
    });

    const totalRevenue = salesAgg._sum.totalRevenue || 0;
    const totalChickensSold = salesAgg._sum.chickensSold || 0;

    // Expected revenue: for active growing chicks (est. ₹185 per 2.2kg bird) + realized revenue
    const expectedRevenue = totalRevenue + (aliveChicks * 185);
    const estimatedProfit = expectedRevenue - totalExpenditure;
    const netRealizedProfit = totalRevenue - totalExpenditure;

    // 6. Recent Batches with status
    const recentBatches = await prisma.batch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { dailyRecords: true },
    });

    // 7. Recent Expenses
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { date: 'desc' },
    });

    // 8. Recent Sales
    const recentSales = await prisma.sales.findMany({
      take: 5,
      orderBy: { saleDate: 'desc' },
    });

    // 9. Monthly Revenue vs Expense Chart Data
    const allExpenses = await prisma.expense.findMany({ orderBy: { date: 'asc' } });
    const allSales = await prisma.sales.findMany({ orderBy: { saleDate: 'asc' } });

    const monthlyMap: Record<string, { month: string; expense: number; revenue: number; profit: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Group expenses by month
    allExpenses.forEach((e) => {
      const d = new Date(e.date);
      const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthlyMap[mKey]) monthlyMap[mKey] = { month: mKey, expense: 0, revenue: 0, profit: 0 };
      monthlyMap[mKey].expense += e.amount;
    });

    // Group sales by month
    allSales.forEach((s) => {
      const d = new Date(s.saleDate);
      const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthlyMap[mKey]) monthlyMap[mKey] = { month: mKey, expense: 0, revenue: 0, profit: 0 };
      monthlyMap[mKey].revenue += s.totalRevenue;
    });

    Object.values(monthlyMap).forEach((item) => {
      item.profit = item.revenue - item.expense;
    });

    const monthlyChartData = Object.values(monthlyMap);

    return NextResponse.json({
      totalBatches,
      activeBatches: activeBatchesCount,
      completedBatches: completedBatchesCount,
      totalChicks,
      aliveChicks,
      deadChicks,
      mortalityPercentage,
      feedConsumed: Math.round(feedConsumed),
      feedRemaining: Math.round(feedRemaining),
      medicineCost,
      electricityCost,
      labourCost,
      maintenanceCost,
      totalExpenditure,
      totalRevenue,
      expectedRevenue,
      estimatedProfit,
      netRealizedProfit,
      totalChickensSold,
      electricityUnits,
      categoryExpenses: {
        feed: feedCost,
        medicine: medicineCost,
        electricity: electricityCost,
        labour: labourCost,
        maintenance: maintenanceCost,
        other: Math.max(0, directExpenses - (feedCost + medicineCost + electricityCost + labourCost + maintenanceCost)),
      },
      recentBatches,
      recentExpenses,
      recentSales,
      monthlyChartData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute dashboard stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
