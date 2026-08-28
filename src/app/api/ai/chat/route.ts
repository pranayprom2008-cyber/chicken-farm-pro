import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { GeminiFarmService } from '@/lib/gemini/service';
import { GEMINI_MODEL, RATE_LIMIT } from '@/lib/gemini/config';
import { FarmContextSnapshot, ConversationContext } from '@/lib/chickai/types';
import { isEmailAuthorized, AUTHORIZED_EMAIL } from '@/lib/authSecurity';

// In-memory rate limiting map: ipOrUser -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  entry.count += 1;
  return true;
}

const geminiService = new GeminiFarmService();

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      clientContext,
      conversationContext,
      attachedImage,
      userEmail,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid message string is required' }, { status: 400 });
    }

    // Input length limit
    if (message.length > RATE_LIMIT.MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: 'Message exceeds maximum allowed length (4,000 characters).' },
        { status: 400 }
      );
    }

    // Identify requester for rate-limiting & authorization
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'client';
    const email = userEmail || AUTHORIZED_EMAIL;

    // Rate Limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a moment before sending more requests.',
        },
        { status: 429 }
      );
    }

    // Load live authoritative records from database
    let batches: any[] = [];
    let expenses: any[] = [];
    let sales: any[] = [];
    let stats: any = null;
    let settings: any = null;

    try {
      [batches, expenses, sales, settings] = await Promise.all([
        prisma.batch.findMany({
          include: {
            expenses: { orderBy: { date: 'desc' }, take: 10 },
            salesRecords: { orderBy: { saleDate: 'desc' } },
            dailyRecords: { orderBy: { date: 'desc' }, take: 10 },
          },
          orderBy: { createdAt: 'desc' },
        }).catch(() => []),
        prisma.expense.findMany({
          orderBy: { date: 'desc' },
          take: 30,
        }).catch(() => []),
        prisma.sales.findMany({
          orderBy: { saleDate: 'desc' },
          take: 20,
        }).catch(() => []),
        prisma.setting.findFirst().catch(() => null),
      ]);
    } catch (dbErr) {
      console.warn('[AI_ROUTE_DB_NOTICE]', dbErr);
    }

    // Prioritize client state if DB is cold / offline
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

    // Execute through Gemini 3.1 Flash-Lite service
    const result = await geminiService.processTurn(
      message,
      history,
      contextSnapshot,
      convContext,
      email,
      attachedImage
    );

    const latencyMs = Date.now() - startTime;
    console.log(`[AI_CHAT_COMPLETED] Model: ${result.modelUsed}, Latency: ${latencyMs}ms, Success: ${result.success}`);

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
      model: result.modelUsed,
      latencyMs,
    });
  } catch (error: any) {
    console.error('[AI_CHAT_ROUTE_EXCEPTION]', error);
    return NextResponse.json(
      {
        success: false,
        error: '⚠️ AI is temporarily unavailable. Please try again.',
      },
      { status: 500 }
    );
  }
}
