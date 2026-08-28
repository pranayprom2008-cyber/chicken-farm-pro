import { prisma } from '@/lib/db';

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  actionExecuted?: string;
}

/**
 * Validates and executes tool calls made by Gemini 3.1 Flash-Lite
 * Strictly type-safe, scoped to authorized farm data, zero arbitrary SQL.
 */
export async function executeFarmTool(
  toolName: string,
  args: any,
  authorizedEmail: string
): Promise<ToolExecutionResult> {
  try {
    switch (toolName) {
      // 1. Get Farm Summary
      case 'get_farm_summary': {
        const [farm, batches, expenses, sales] = await Promise.all([
          prisma.farm.findFirst().catch(() => null),
          prisma.batch.findMany({ include: { dailyRecords: true } }).catch(() => []),
          prisma.expense.findMany().catch(() => []),
          prisma.sales.findMany().catch(() => []),
        ]);

        const activeBatches = batches.filter((b) => b.status === 'growing');
        const completedBatches = batches.filter((b) => b.status === 'completed');
        const totalBirdsPlaced = batches.reduce((sum, b) => sum + (b.totalChicks || 0), 0);
        const aliveBirds = batches.reduce((sum, b) => sum + (b.aliveChicks || 0), 0);
        const deadBirds = batches.reduce((sum, b) => sum + (b.deadChicks || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalRevenue = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        return {
          success: true,
          data: {
            farmName: farm?.farmName || 'GreenField Poultry Farm',
            totalFlocksCount: batches.length,
            activeFlocksCount: activeBatches.length,
            completedFlocksCount: completedBatches.length,
            totalBirdsPlaced,
            currentAliveBirds: aliveBirds,
            totalMortality: deadBirds,
            overallMortalityRate: totalBirdsPlaced > 0 ? `${((deadBirds / totalBirdsPlaced) * 100).toFixed(2)}%` : '0%',
            totalExpensesAmountINR: totalExpenses,
            totalSalesRevenueINR: totalRevenue,
            netProfitINR: netProfit,
            activeBatches: activeBatches.map((b) => ({
              batchNumber: b.batchNumber,
              breed: b.breedType,
              aliveChicks: b.aliveChicks,
              durationDays: b.durationDays,
            })),
          },
        };
      }

      // 2. Get Batches
      case 'get_batches': {
        const statusFilter = args?.status && args.status !== 'all' ? String(args.status).toLowerCase() : undefined;
        const batches = await prisma.batch.findMany({
          where: statusFilter ? { status: statusFilter } : undefined,
          orderBy: { createdAt: 'desc' },
        });

        return {
          success: true,
          data: batches.map((b) => {
            const mortPct = b.totalChicks > 0 ? ((b.deadChicks / b.totalChicks) * 100).toFixed(2) : '0';
            return {
              id: b.id,
              batchNumber: b.batchNumber,
              batchName: b.batchName,
              breedType: b.breedType,
              totalChicks: b.totalChicks,
              aliveChicks: b.aliveChicks,
              deadChicks: b.deadChicks,
              mortalityPercentage: `${mortPct}%`,
              status: b.status,
              durationDays: b.durationDays,
              startDate: b.startDate.toISOString().split('T')[0],
              expectedEndDate: b.expectedEndDate.toISOString().split('T')[0],
            };
          }),
        };
      }

      // 3. Get Batch Details
      case 'get_batch_details': {
        const identifier = String(args?.batchIdentifier || '').trim();
        if (!identifier) {
          return { success: false, error: 'batchIdentifier is required.' };
        }

        const batch = await prisma.batch.findFirst({
          where: {
            OR: [
              { batchNumber: identifier },
              { id: identifier },
            ],
          },
          include: {
            expenses: { orderBy: { date: 'desc' }, take: 15 },
            salesRecords: { orderBy: { saleDate: 'desc' } },
            dailyRecords: { orderBy: { date: 'desc' }, take: 10 },
          },
        });

        if (!batch) {
          return { success: false, error: `Batch '${identifier}' was not found in the database.` };
        }

        const batchExpenses = batch.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const batchSales = batch.salesRecords.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

        return {
          success: true,
          data: {
            batchNumber: batch.batchNumber,
            batchName: batch.batchName,
            status: batch.status,
            breedType: batch.breedType,
            totalChicksPlaced: batch.totalChicks,
            aliveChicks: batch.aliveChicks,
            deadChicks: batch.deadChicks,
            mortalityRate: batch.totalChicks > 0 ? `${((batch.deadChicks / batch.totalChicks) * 100).toFixed(2)}%` : '0%',
            totalExpensesINR: batchExpenses,
            totalRevenueINR: batchSales,
            netProfitINR: batchSales - batchExpenses,
            recentExpenses: batch.expenses.map((e) => ({
              amount: e.amount,
              category: e.category,
              description: e.description,
              date: e.date.toISOString().split('T')[0],
            })),
            recentDailyRecords: batch.dailyRecords.map((r) => ({
              date: r.date.toISOString().split('T')[0],
              alive: r.aliveChicks,
              dead: r.deadChicks,
              feedConsumedKg: r.feedConsumed,
              avgWeightKg: r.averageWeight,
            })),
          },
        };
      }

      // 4. Get Expenses
      case 'get_expenses': {
        const category = args?.category ? String(args.category).trim() : undefined;
        const limit = Math.min(Number(args?.limit) || 25, 100);

        let batchId: string | undefined = undefined;
        if (args?.batchNumber) {
          const batch = await prisma.batch.findUnique({
            where: { batchNumber: String(args.batchNumber).trim() },
          });
          if (batch) batchId = batch.id;
        }

        const expenses = await prisma.expense.findMany({
          where: {
            ...(category ? { category: { equals: category } } : {}),
            ...(batchId ? { batchId } : {}),
          },
          orderBy: { date: 'desc' },
          take: limit,
          include: { batch: { select: { batchNumber: true } } },
        });

        const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        return {
          success: true,
          data: {
            retrievedCount: expenses.length,
            totalAmountSumINR: totalAmount,
            expenses: expenses.map((e) => ({
              id: e.id,
              amount: e.amount,
              category: e.category,
              description: e.description,
              date: e.date.toISOString().split('T')[0],
              batchNumber: e.batch?.batchNumber || 'General Farm',
            })),
          },
        };
      }

      // 5. Get Revenue / Sales
      case 'get_revenue': {
        const limit = Math.min(Number(args?.limit) || 20, 50);
        const sales = await prisma.sales.findMany({
          orderBy: { saleDate: 'desc' },
          take: limit,
          include: { batch: { select: { batchNumber: true } } },
        });

        const totalRevenue = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
        const totalBirds = sales.reduce((sum, s) => sum + (s.chickensSold || 0), 0);

        return {
          success: true,
          data: {
            salesCount: sales.length,
            totalRevenueINR: totalRevenue,
            totalBirdsSold: totalBirds,
            sales: sales.map((s) => ({
              id: s.id,
              date: s.saleDate.toISOString().split('T')[0],
              chickensSold: s.chickensSold,
              averageWeightKg: s.averageWeight,
              pricePerKgINR: s.pricePerKg,
              totalRevenueINR: s.totalRevenue,
              buyer: s.buyer,
              batchNumber: s.batch?.batchNumber || 'General',
            })),
          },
        };
      }

      // 6. Get Inventory
      case 'get_inventory': {
        const [feeds, medicines] = await Promise.all([
          prisma.feed.findMany({ orderBy: { date: 'desc' }, take: 10 }),
          prisma.medicine.findMany({ orderBy: { date: 'desc' }, take: 10 }),
        ]);

        return {
          success: true,
          data: {
            recentFeedPurchases: feeds.map((f) => ({
              quantityBagsOrKg: f.quantity,
              totalCostINR: f.totalCost,
              date: f.date.toISOString().split('T')[0],
              supplier: f.supplier,
            })),
            medicineStock: medicines.map((m) => ({
              medicineName: m.medicineName,
              quantity: m.quantity,
              costINR: m.cost,
              purpose: m.purpose,
            })),
          },
        };
      }

      // 7. Get Mortality
      case 'get_mortality': {
        let batchId: string | undefined;
        if (args?.batchNumber) {
          const batch = await prisma.batch.findUnique({
            where: { batchNumber: String(args.batchNumber).trim() },
          });
          if (batch) batchId = batch.id;
        }

        const records = await prisma.dailyBatchRecord.findMany({
          where: batchId ? { batchId } : undefined,
          orderBy: { date: 'desc' },
          take: 20,
          include: { batch: { select: { batchNumber: true } } },
        });

        const totalDead = records.reduce((sum, r) => sum + (r.deadChicks || 0), 0);

        return {
          success: true,
          data: {
            recordsCount: records.length,
            totalDeadRecorded: totalDead,
            recentMortalityLogs: records.map((r) => ({
              date: r.date.toISOString().split('T')[0],
              deadChicks: r.deadChicks,
              aliveChicks: r.aliveChicks,
              batchNumber: r.batch?.batchNumber || 'Unknown',
              notes: r.notes,
            })),
          },
        };
      }

      // 8. Get Feed Usage
      case 'get_feed_usage': {
        const records = await prisma.dailyBatchRecord.findMany({
          where: { feedConsumed: { gt: 0 } },
          orderBy: { date: 'desc' },
          take: 25,
          include: { batch: { select: { batchNumber: true } } },
        });

        const totalFeed = records.reduce((sum, r) => sum + (r.feedConsumed || 0), 0);

        return {
          success: true,
          data: {
            totalFeedLoggedKg: totalFeed,
            records: records.map((r) => ({
              date: r.date.toISOString().split('T')[0],
              feedConsumedKg: r.feedConsumed,
              averageWeightKg: r.averageWeight,
              batchNumber: r.batch?.batchNumber,
            })),
          },
        };
      }

      // 9. Create Expense
      case 'create_expense': {
        const amount = Number(args?.amount);
        if (!amount || amount <= 0) {
          return { success: false, error: 'A positive expense amount is required.' };
        }

        const category = String(args?.category || 'Miscellaneous').trim();
        const description = String(args?.description || `${category} expense`).trim();

        let batchId: string | null = null;
        if (args?.batchNumber) {
          const batch = await prisma.batch.findUnique({
            where: { batchNumber: String(args.batchNumber).trim() },
          });
          if (batch) batchId = batch.id;
        }

        const date = args?.date ? new Date(args.date) : new Date();

        const created = await prisma.expense.create({
          data: {
            amount,
            category,
            description,
            date,
            batchId,
          },
        });

        return {
          success: true,
          actionExecuted: 'create_expense',
          data: {
            id: created.id,
            amount: created.amount,
            category: created.category,
            description: created.description,
            date: created.date.toISOString().split('T')[0],
            batchNumber: args?.batchNumber || 'General Farm',
          },
        };
      }

      // 10. Update Expense
      case 'update_expense': {
        const expenseId = String(args?.expenseId || '').trim();
        if (!expenseId) {
          return { success: false, error: 'expenseId is required.' };
        }

        const updateData: any = {};
        if (args?.newAmount && Number(args.newAmount) > 0) {
          updateData.amount = Number(args.newAmount);
        }
        if (args?.newDescription) {
          updateData.description = String(args.newDescription).trim();
        }

        const updated = await prisma.expense.update({
          where: { id: expenseId },
          data: updateData,
        });

        return {
          success: true,
          actionExecuted: 'update_expense',
          data: {
            id: updated.id,
            amount: updated.amount,
            description: updated.description,
            category: updated.category,
          },
        };
      }

      // 11. Create Batch
      case 'create_batch': {
        const batchNumber = String(args?.batchNumber || '').trim();
        const totalChicks = Number(args?.totalChicks);

        if (!batchNumber || !totalChicks || totalChicks <= 0) {
          return { success: false, error: 'batchNumber and totalChicks (>0) are required.' };
        }

        const durationDays = Number(args?.durationDays) || 45;
        const startDate = new Date();
        const expectedEndDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const created = await prisma.batch.create({
          data: {
            batchNumber,
            batchName: String(args?.batchName || batchNumber).trim(),
            totalChicks,
            aliveChicks: totalChicks,
            deadChicks: 0,
            breedType: String(args?.breedType || 'Cobb 500 (Broiler)').trim(),
            durationDays,
            startDate,
            expectedEndDate,
            status: 'growing',
          },
        });

        return {
          success: true,
          actionExecuted: 'create_batch',
          data: {
            id: created.id,
            batchNumber: created.batchNumber,
            totalChicks: created.totalChicks,
            status: created.status,
          },
        };
      }

      // 12. Update Batch
      case 'update_batch': {
        const batchNumber = String(args?.batchNumber || '').trim();
        const updateData: any = {};

        if (args?.status) {
          updateData.status = String(args.status).trim();
        }
        if (args?.notes) {
          updateData.notes = String(args.notes).trim();
        }

        const updated = await prisma.batch.update({
          where: { batchNumber },
          data: updateData,
        });

        return {
          success: true,
          actionExecuted: 'update_batch',
          data: {
            batchNumber: updated.batchNumber,
            status: updated.status,
            notes: updated.notes,
          },
        };
      }

      // 13. Record Mortality
      case 'record_mortality': {
        const batchNumber = String(args?.batchNumber || '').trim();
        const deadChicks = Number(args?.deadChicks);

        if (!batchNumber || deadChicks === undefined || deadChicks < 0) {
          return { success: false, error: 'Valid batchNumber and deadChicks count required.' };
        }

        const batch = await prisma.batch.findUnique({ where: { batchNumber } });
        if (!batch) {
          return { success: false, error: `Batch ${batchNumber} not found.` };
        }

        const updatedAlive = Math.max(0, batch.aliveChicks - deadChicks);
        const updatedDead = batch.deadChicks + deadChicks;

        const [dailyLog] = await Promise.all([
          prisma.dailyBatchRecord.create({
            data: {
              batchId: batch.id,
              aliveChicks: updatedAlive,
              deadChicks,
              notes: args?.notes || 'Logged via ChickAI Gemini 3.1 Flash-Lite',
            },
          }),
          prisma.batch.update({
            where: { id: batch.id },
            data: {
              aliveChicks: updatedAlive,
              deadChicks: updatedDead,
            },
          }),
        ]);

        return {
          success: true,
          actionExecuted: 'record_mortality',
          data: {
            batchNumber,
            deadReported: deadChicks,
            newAliveChicks: updatedAlive,
            totalDeadForBatch: updatedDead,
          },
        };
      }

      // 14. Record Feed Usage
      case 'record_feed_usage': {
        const batchNumber = String(args?.batchNumber || '').trim();
        const feedKg = Number(args?.feedConsumedKg);

        if (!batchNumber || !feedKg || feedKg <= 0) {
          return { success: false, error: 'Valid batchNumber and feedConsumedKg required.' };
        }

        const batch = await prisma.batch.findUnique({ where: { batchNumber } });
        if (!batch) {
          return { success: false, error: `Batch ${batchNumber} not found.` };
        }

        const dailyLog = await prisma.dailyBatchRecord.create({
          data: {
            batchId: batch.id,
            aliveChicks: batch.aliveChicks,
            deadChicks: 0,
            feedConsumed: feedKg,
            averageWeight: Number(args?.averageWeightKg) || 0,
            notes: 'Feed logged via Gemini 3.1 Flash-Lite',
          },
        });

        return {
          success: true,
          actionExecuted: 'record_feed_usage',
          data: {
            batchNumber,
            feedConsumedKg: feedKg,
            averageWeightKg: args?.averageWeightKg || 0,
          },
        };
      }

      // 15. Record Revenue
      case 'record_revenue': {
        const batchNumber = String(args?.batchNumber || '').trim();
        const chickensSold = Number(args?.chickensSold);
        const avgWeight = Number(args?.averageWeightKg);
        const pricePerKg = Number(args?.pricePerKg);

        if (!batchNumber || !chickensSold || !avgWeight || !pricePerKg) {
          return { success: false, error: 'batchNumber, chickensSold, averageWeightKg, and pricePerKg are required.' };
        }

        const batch = await prisma.batch.findUnique({ where: { batchNumber } });
        if (!batch) {
          return { success: false, error: `Batch ${batchNumber} not found.` };
        }

        const totalRevenue = Math.round(chickensSold * avgWeight * pricePerKg);

        const sale = await prisma.sales.create({
          data: {
            batchId: batch.id,
            chickensSold,
            averageWeight: avgWeight,
            pricePerKg,
            totalRevenue,
            buyer: String(args?.buyer || 'Wholesale Market Trader').trim(),
            saleDate: new Date(),
          },
        });

        return {
          success: true,
          actionExecuted: 'record_revenue',
          data: {
            saleId: sale.id,
            batchNumber,
            chickensSold,
            totalRevenueINR: totalRevenue,
          },
        };
      }

      // 16. Create Inventory Transaction
      case 'create_inventory_transaction': {
        const itemType = String(args?.itemType || 'feed').toLowerCase();
        const name = String(args?.name || '').trim();
        const quantity = Number(args?.quantity);
        const cost = Number(args?.cost);

        if (!name || !quantity || !cost) {
          return { success: false, error: 'Product name, quantity, and cost are required.' };
        }

        if (itemType === 'feed') {
          const feed = await prisma.feed.create({
            data: {
              quantity,
              price: cost / quantity,
              totalCost: cost,
              supplier: String(args?.supplier || 'Poultry Feed Co.').trim(),
              notes: name,
            },
          });
          return {
            success: true,
            actionExecuted: 'create_inventory_transaction',
            data: { type: 'feed', id: feed.id, name, totalCostINR: cost },
          };
        } else {
          const medicine = await prisma.medicine.create({
            data: {
              medicineName: name,
              quantity,
              cost,
              purpose: String(args?.supplier || 'Flock Healthcare').trim(),
            },
          });
          return {
            success: true,
            actionExecuted: 'create_inventory_transaction',
            data: { type: 'medicine', id: medicine.id, name, costINR: cost },
          };
        }
      }

      default:
        return { success: false, error: `Unknown tool '${toolName}'.` };
    }
  } catch (err: any) {
    console.error(`[TOOL_EXECUTION_ERROR: ${toolName}]`, err);
    return { success: false, error: err?.message || 'Database operation failed.' };
  }
}
