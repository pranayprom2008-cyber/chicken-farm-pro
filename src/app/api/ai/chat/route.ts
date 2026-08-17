import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ChickAIConversationManager } from '@/lib/chickai/conversationManager';
import { FarmContextSnapshot, ConversationContext } from '@/lib/chickai/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      clientContext,
      conversationContext,
    } = body;

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

    // Prioritize client state if DB is empty / offline
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
      currentPath: clientContext?.currentPath,
    };

    const convContext: ConversationContext = conversationContext || {
      state: 'IDLE',
      lastBatchId: body.lastBatchId || null,
      pendingAction: null,
    };

    const manager = new ChickAIConversationManager(contextSnapshot);
    const result = manager.process(message, convContext, history);

    return NextResponse.json({
      success: true,
      result,
      message: result.message,
      nextState: result.nextState,
      intent: result.intent,
      pendingAction: result.pendingAction,
      lastBatchId: result.lastBatchId,
      sessionMemory: result.sessionMemory,
      stopAudio: result.stopAudio,
      resumeAudioText: result.resumeAudioText,
      speedAdjustment: result.speedAdjustment,
    });
  } catch (error: any) {
    console.error('ChickAI Conversation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '⚠️ I couldn\'t retrieve your farm data right now. Please try again.',
      },
      { status: 500 }
    );
  }
}
