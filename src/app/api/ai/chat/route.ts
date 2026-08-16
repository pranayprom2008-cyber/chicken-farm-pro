import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ChickAIEngine } from '@/lib/chickai/engine';
import { FarmContextSnapshot } from '@/lib/chickai/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], clientContext, lastBatchId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message query is required' }, { status: 400 });
    }

    // Attempt to load live server records from Prisma
    let batches: any[] = [];
    let expenses: any[] = [];
    let sales: any[] = [];
    let stats: any = null;
    let settings: any = null;

    try {
      batches = await prisma.batch.findMany({
        include: {
          expenses: true,
          salesRecords: true,
          dailyRecords: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      expenses = await prisma.expense.findMany({
        orderBy: { date: 'desc' },
      });

      sales = await prisma.sales.findMany({
        orderBy: { saleDate: 'desc' },
      });

      settings = await prisma.setting.findFirst();
    } catch {
      // Ephemeral serverless fallback
    }

    // If database returned fewer records than client's active localStorage, prioritize client snapshot
    if ((!batches || batches.length === 0) && clientContext?.batches?.length > 0) {
      batches = clientContext.batches;
    }
    if ((!expenses || expenses.length === 0) && clientContext?.expenses?.length > 0) {
      expenses = clientContext.expenses;
    }
    if ((!sales || sales.length === 0) && clientContext?.sales?.length > 0) {
      sales = clientContext.sales;
    }
    if (clientContext?.stats) {
      stats = clientContext.stats;
    }
    if (!settings && clientContext?.settings) {
      settings = clientContext.settings;
    }

    const contextSnapshot: FarmContextSnapshot = {
      batches: batches || [],
      expenses: expenses || [],
      sales: sales || [],
      billingHistory: clientContext?.billingHistory || [],
      stats: stats || clientContext?.stats || {},
      settings: settings || clientContext?.settings || {},
    };

    const engine = new ChickAIEngine(contextSnapshot);
    if (lastBatchId) {
      engine.setLastBatch(lastBatchId);
    }

    const responseMessage = engine.processQuery(message, history);

    return NextResponse.json({
      success: true,
      message: responseMessage,
      lastBatchId: engine.getLastBatch(),
    });
  } catch (error: any) {
    console.error('ChickAI Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '⚠️ I couldn\'t retrieve your farm data right now. Please try again.',
      },
      { status: 500 }
    );
  }
}
