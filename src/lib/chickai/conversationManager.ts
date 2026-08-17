// ==========================================
// CHICKAI CONVERSATIONAL STATE MACHINE & INTENT MANAGER
// ==========================================

import {
  ConversationState,
  UserIntent,
  ConversationContext,
  ConversationProcessResult,
  FarmContextSnapshot,
  ChickAIMessage,
  ActionProposal,
  VoiceSessionMemory
} from './types';
import { ChickAIEngine } from './engine';

export class ChickAIConversationManager {
  private engine: ChickAIEngine;
  private farmSnapshot: FarmContextSnapshot;

  constructor(snapshot: FarmContextSnapshot) {
    this.farmSnapshot = snapshot;
    this.engine = new ChickAIEngine(snapshot);
  }

  /**
   * Classify user intent taking conversation context and current state into account
   */
  public classifyIntent(rawQuery: string, context: ConversationContext): UserIntent {
    const q = rawQuery.toLowerCase().trim();

    // 1. Check for Stop / Silence request
    if (
      q === 'stop' ||
      q === 'stop speaking' ||
      q === 'stop talking' ||
      q === 'be quiet' ||
      q === 'quiet' ||
      q === 'shut up' ||
      q === "that's enough" ||
      q === 'thats enough' ||
      q === 'pause' ||
      q === 'hush' ||
      q === 'mute'
    ) {
      return 'STOP_SPEAKING';
    }

    // 2. Check for Wait request
    if (
      q === 'wait' ||
      q === 'hold on' ||
      q === 'wait a sec' ||
      q === 'wait a second' ||
      q === 'wait a minute' ||
      q === 'give me a second' ||
      q === 'give me a minute' ||
      q === 'hang on' ||
      q === 'wait for me'
    ) {
      return 'WAIT';
    }

    // 3. Check for Repeat request
    if (
      q === 'repeat' ||
      q === 'repeat that' ||
      q === 'say that again' ||
      q === 'what did you say' ||
      q === 'say again' ||
      q === 'pardon' ||
      q === 'can you repeat' ||
      q === 'repeat please'
    ) {
      return 'REPEAT';
    }

    // 4. Check for Continue request
    if (
      q === 'continue' ||
      q === 'keep going' ||
      q === 'go on' ||
      q === 'carry on' ||
      q === 'resume' ||
      q === 'finish' ||
      q === 'finish what you were saying' ||
      q === 'okay continue' ||
      q === 'ok continue'
    ) {
      return 'CONTINUE';
    }

    // 5. Check for Speed adjustment
    if (q === 'slow down' || q === 'speak slower' || q === 'too fast' || q === 'speak slowly' || q === 'talk slower') {
      return 'SLOW_DOWN';
    }
    if (q === 'speed up' || q === 'faster' || q === 'speak faster' || q === 'talk faster' || q === 'too slow') {
      return 'SPEED_UP';
    }

    // 6. Direct confirmation / save triggers
    const confirmPhrases = [
      'yes', 'yeah', 'yep', 'do it', 'go ahead', 'confirm', 'save it', 'save that', 'save this',
      'save there', 'save it there', 'save this information', 'okay', 'ok', 'proceed', 'sure',
      'save', 'please do', 'yes please', 'yes save it', 'yes do it', 'affirmative', 'correct',
      'that is correct', 'right', 'all good', 'looks good', 'record it', 'store it'
    ];

    if (context.pendingAction || context.state === 'WAITING_FOR_CONFIRMATION') {
      if (confirmPhrases.some((p) => q === p || q.startsWith(`${p} `) || q.endsWith(` ${p}`))) {
        return 'CONFIRM';
      }

      // Check for Cancellation
      const cancelPhrases = [
        'no', 'nope', 'cancel', "don't", 'dont', 'never mind', 'nevermind', "don't do that",
        'dont do that', 'forget it', "don't save", 'dont save', 'reject', 'abort',
        "no don't", 'actually no', 'no cancel'
      ];
      if (cancelPhrases.some((p) => q === p || q.startsWith(`${p} `) || q.endsWith(` ${p}`))) {
        return 'CANCEL';
      }

      // Check for Modifications / Corrections while in confirmation
      if (
        q.includes('actually') ||
        q.includes('make it') ||
        q.includes('make that') ||
        q.includes('change to') ||
        q.includes('change that') ||
        q.includes('change amount') ||
        q.includes('instead') ||
        q.includes('add another') ||
        q.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})*|\d+)/) ||
        q.includes('batch')
      ) {
        return 'CHANGE_REQUEST';
      }
    }

    // 7. Slot filling when waiting for category
    if (context.state === 'WAITING_FOR_INFORMATION' && context.waitingForField) {
      return 'CORRECT';
    }

    // 8. General conversational greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'thank you', 'thanks', 'are you there', 'who are you', 'what can you do', 'help'];
    if (greetings.some((g) => q === g || q.startsWith(`${g} chickai`) || q.startsWith(`${g} assistant`))) {
      return 'GENERAL_CONVERSATION';
    }

    // 9. Standard database action or farm query
    if (
      q.includes('add') ||
      q.includes('record') ||
      q.includes('create') ||
      q.includes('log') ||
      q.includes('spent') ||
      q.includes('delete') ||
      q.includes('change') ||
      q.includes('update') ||
      q.includes('save') ||
      q.includes('put this') ||
      q.includes('remember')
    ) {
      return 'DATABASE_ACTION';
    }

    return 'FARM_QUERY';
  }

  /**
   * Process a conversational turn with full state machine transitions and session memory
   */
  public process(
    rawQuery: string,
    context: ConversationContext,
    history: ChickAIMessage[] = []
  ): ConversationProcessResult {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleanQuery = rawQuery.trim();
    const q = cleanQuery.toLowerCase();
    const intent = this.classifyIntent(cleanQuery, context);

    const memory: VoiceSessionMemory = { ...(context.sessionMemory || {}) };

    // Extract any batch references from query to keep session memory fresh
    const batchNumMatch = cleanQuery.match(/\b(?:batch\s*#?|b-?)(\d+)\b/i);
    if (batchNumMatch && batchNumMatch[1]) {
      const targetBNum = `Batch ${batchNumMatch[1]}`;
      const foundBatch = this.farmSnapshot.batches.find((b) => b.batchNumber.toLowerCase().includes(batchNumMatch[1]));
      memory.currentBatch = foundBatch ? foundBatch.batchNumber : targetBNum;
      memory.currentBatchId = foundBatch ? foundBatch.id : undefined;
    }

    // Extract category if mentioned
    const cats = ['Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Transportation', 'Chicks', 'Other'];
    for (const cat of cats) {
      if (q.includes(cat.toLowerCase())) {
        memory.currentCategory = cat;
        break;
      }
    }

    // Extract amounts if mentioned
    const amtMatch = cleanQuery.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)/i);
    if (amtMatch && amtMatch[1]) {
      const amtVal = parseFloat(amtMatch[1].replace(/,/g, ''));
      if (!isNaN(amtVal) && amtVal > 0) {
        memory.lastMentionedAmount = amtVal;
      }
    }

    // ====================================================
    // 1. INTENT: STOP_SPEAKING
    // ====================================================
    if (intent === 'STOP_SPEAKING') {
      return {
        message: {
          id: `stop-${Date.now()}`,
          sender: 'assistant',
          text: '🔇 *Speech stopped.* I\'m here whenever you\'re ready.',
          timestamp: timeStr,
        },
        nextState: 'IDLE',
        intent: 'STOP_SPEAKING',
        stopAudio: true,
        pendingAction: context.pendingAction,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 2. INTENT: WAIT
    // ====================================================
    if (intent === 'WAIT') {
      return {
        message: {
          id: `wait-${Date.now()}`,
          sender: 'assistant',
          text: '⏳ *Sure, I\'ll wait.* Take your time.',
          timestamp: timeStr,
        },
        nextState: context.pendingAction ? 'WAITING_FOR_CONFIRMATION' : 'IDLE',
        intent: 'WAIT',
        stopAudio: true,
        pendingAction: context.pendingAction,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 3. INTENT: REPEAT
    // ====================================================
    if (intent === 'REPEAT') {
      const textToRepeat =
        context.lastAssistantResponse ||
        (history.filter((m) => m.sender === 'assistant').slice(-1)[0]?.text) ||
        'I am ChickAI, your friendly farm copilot.';

      return {
        message: {
          id: `rep-${Date.now()}`,
          sender: 'assistant',
          text: textToRepeat,
          timestamp: timeStr,
          actionProposal: context.pendingAction || undefined,
        },
        nextState: context.pendingAction ? 'WAITING_FOR_CONFIRMATION' : 'IDLE',
        intent: 'REPEAT',
        resumeAudioText: textToRepeat,
        pendingAction: context.pendingAction,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 4. INTENT: CONTINUE
    // ====================================================
    if (intent === 'CONTINUE') {
      let continuation = context.interruptedMessage;
      if (!continuation) {
        continuation = context.lastAssistantResponse || 'All farm systems are operational. How else can I assist with your flocks?';
      }

      return {
        message: {
          id: `cont-${Date.now()}`,
          sender: 'assistant',
          text: `Sure. Continuing from where we left off:\n\n${continuation}`,
          timestamp: timeStr,
          actionProposal: context.pendingAction || undefined,
        },
        nextState: context.pendingAction ? 'WAITING_FOR_CONFIRMATION' : 'IDLE',
        intent: 'CONTINUE',
        resumeAudioText: continuation,
        pendingAction: context.pendingAction,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 5. INTENT: SPEED ADJUSTMENT
    // ====================================================
    if (intent === 'SLOW_DOWN') {
      return {
        message: {
          id: `spd-${Date.now()}`,
          sender: 'assistant',
          text: '🐢 *Sure, I\'ll speak slower for you.*',
          timestamp: timeStr,
        },
        nextState: 'IDLE',
        intent: 'SLOW_DOWN',
        speedAdjustment: -0.15,
        pendingAction: context.pendingAction,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }
    if (intent === 'SPEED_UP') {
      return {
        message: {
          id: `spd-${Date.now()}`,
          sender: 'assistant',
          text: '⚡ *Got it! I\'ll speak a bit faster.*',
          timestamp: timeStr,
        },
        nextState: 'IDLE',
        intent: 'SPEED_UP',
        speedAdjustment: +0.15,
        pendingAction: context.pendingAction,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 6. INTENT: CONFIRM / SAVE ("Save that", "Save it", "Save there")
    // ====================================================
    if (
      (intent === 'CONFIRM' || q.includes('save that') || q.includes('save it') || q.includes('save this') || q.includes('save there')) &&
      context.pendingAction
    ) {
      const proposal = { ...context.pendingAction };
      proposal.status = 'confirmed';
      const targetB = proposal.details.batchNumber || memory.currentBatch || 'Batch 12';

      let shortConf = `Saved to ${targetB}.`;
      if (proposal.type === 'create_expense') {
        shortConf = `Added ₹${(proposal.details.amount || 0).toLocaleString('en-IN')} ${proposal.details.category || 'Expense'}.`;
      } else if (proposal.type === 'create_batch') {
        shortConf = `Created ${proposal.details.batchNumber || 'New Batch'} with ${(proposal.details.totalChicks || 5000).toLocaleString()} chicks.`;
      } else if (proposal.type === 'add_mortality') {
        shortConf = `Mortality recorded for ${targetB}.`;
      }

      return {
        message: {
          id: `act-${Date.now()}`,
          sender: 'assistant',
          text: `✅ **${shortConf}**`,
          timestamp: timeStr,
          actionProposal: proposal,
        },
        nextState: 'ACTION_COMPLETED',
        intent: 'CONFIRM',
        pendingAction: null,
        lastBatchId: proposal.details.batchId || context.lastBatchId,
        handledDirectly: true,
        sessionMemory: {
          ...memory,
          lastCreatedRecord: {
            type: proposal.type === 'create_batch' ? 'batch' : proposal.type === 'create_expense' ? 'expense' : 'mortality',
            id: proposal.details.batchId || `rec-${Date.now()}`,
            amount: proposal.details.amount,
            batchNumber: targetB,
            category: proposal.details.category,
          },
        },
      };
    }

    // ====================================================
    // 7. INTENT: CANCEL (Discard Pending Action)
    // ====================================================
    if (intent === 'CANCEL' && (context.pendingAction || context.state === 'WAITING_FOR_CONFIRMATION' || context.state === 'WAITING_FOR_INFORMATION')) {
      return {
        message: {
          id: `cancel-${Date.now()}`,
          sender: 'assistant',
          text: '↩️ *Okay, cancelled.* No changes were made to your farm database.',
          timestamp: timeStr,
        },
        nextState: 'CANCELLED',
        intent: 'CANCEL',
        pendingAction: null,
        waitingForField: null,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 8. INTENT: CHANGE_REQUEST / CORRECTION / ADD ANOTHER
    // ====================================================
    if (
      (intent === 'CHANGE_REQUEST' || q.includes('change that to') || q.includes('change to') || q.includes('add another')) &&
      (context.pendingAction || memory.lastCreatedRecord || memory.lastMentionedAmount)
    ) {
      let targetAmt = memory.lastMentionedAmount || 1000;
      const numMatch = cleanQuery.match(/(\d{1,3}(?:,\d{3})+|\d+)/);

      if (q.includes('add another') && numMatch) {
        const extra = parseFloat(numMatch[1].replace(/,/g, ''));
        targetAmt += extra;
      } else if (numMatch) {
        targetAmt = parseFloat(numMatch[1].replace(/,/g, ''));
      }

      const cat = memory.currentCategory || 'Expense';
      const batchNum = memory.currentBatch || 'Batch 12';

      const updatedProposal: ActionProposal = {
        type: 'create_expense',
        title: `Save ₹${targetAmt.toLocaleString('en-IN')} ${cat}`,
        details: {
          category: cat,
          amount: targetAmt,
          batchNumber: batchNum,
          description: `ChickAI updated: ${cat} expense`,
          date: new Date().toISOString().split('T')[0],
        },
        status: 'pending',
      };

      return {
        message: {
          id: `mod-${Date.now()}`,
          sender: 'assistant',
          text: `Updated to **₹ ${targetAmt.toLocaleString('en-IN')} ${cat}** for **${batchNum}**.\n\nSave this?`,
          timestamp: timeStr,
          actionProposal: updatedProposal,
        },
        nextState: 'WAITING_FOR_CONFIRMATION',
        intent: 'CHANGE_REQUEST',
        pendingAction: updatedProposal,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: {
          ...memory,
          lastMentionedAmount: targetAmt,
        },
      };
    }

    // ====================================================
    // 9. INTENT: MISSING INFORMATION (Slot Filling)
    // ====================================================
    if (context.state === 'WAITING_FOR_INFORMATION' && context.waitingForField === 'category') {
      let selectedCat = 'Other';
      if (q.includes('feed')) selectedCat = 'Feed';
      else if (q.includes('med') || q.includes('vacc')) selectedCat = 'Medicine';
      else if (q.includes('elec') || q.includes('power')) selectedCat = 'Electricity';
      else if (q.includes('labour') || q.includes('labor') || q.includes('salary')) selectedCat = 'Labour';
      else if (q.includes('maint') || q.includes('repair') || q.includes('husk')) selectedCat = 'Maintenance';
      else if (q.includes('diesel') || q.includes('fuel') || q.includes('trans')) selectedCat = 'Transportation';

      const amount = context.pendingAction?.details?.amount || memory.lastMentionedAmount || 1000;
      const targetBatch = context.pendingAction?.details?.batchNumber || memory.currentBatch || 'General Farm';

      const newProposal: ActionProposal = {
        type: 'create_expense',
        title: `Save ₹${amount.toLocaleString('en-IN')} ${selectedCat} Expense`,
        details: {
          category: selectedCat,
          amount,
          batchNumber: targetBatch,
          description: `ChickAI logged: ${selectedCat} expense`,
          date: new Date().toISOString().split('T')[0],
        },
        status: 'pending',
      };

      return {
        message: {
          id: `fill-${Date.now()}`,
          sender: 'assistant',
          text: `Got it! Recorded **₹ ${amount.toLocaleString('en-IN')} ${selectedCat}** for **${targetBatch}**.\n\nSave this to database?`,
          timestamp: timeStr,
          actionProposal: newProposal,
        },
        nextState: 'WAITING_FOR_CONFIRMATION',
        intent: 'CORRECT',
        pendingAction: newProposal,
        waitingForField: null,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: {
          ...memory,
          currentCategory: selectedCat,
          lastMentionedAmount: amount,
        },
      };
    }

    // ====================================================
    // 10. INTENT: GENERAL CONVERSATION
    // ====================================================
    if (intent === 'GENERAL_CONVERSATION') {
      let responseText = 'Hello! I am ChickAI, your friendly farm copilot. How can I help with your poultry operations today?';

      if (q.includes('good morning')) {
        responseText = 'Good morning! Your farm intelligence system is online. What would you like to check today?';
      } else if (q.includes('good afternoon')) {
        responseText = 'Good afternoon! Flocks and sheds are being monitored live. How can I assist?';
      } else if (q.includes('good evening')) {
        responseText = 'Good evening! Ready to review today\'s telemetry or record daily logs.';
      } else if (q.includes('thank')) {
        responseText = 'You\'re very welcome! Always glad to help keep your farm running smoothly. 😊';
      } else if (q.includes('are you there') || q.includes('you there')) {
        responseText = 'Yes, I\'m right here and connected to your live farm database!';
      } else if (q.includes('who are you') || q.includes('what can you do')) {
        responseText = 'I\'m **ChickAI**, your farm copilot! I can track mortality, record expenses with natural speech, calculate FCR & break-even margins, forecast harvest dates, and generate weekly audit reports.';
      }

      return {
        message: {
          id: `gen-${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: timeStr,
        },
        nextState: 'IDLE',
        intent: 'GENERAL_CONVERSATION',
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
        sessionMemory: memory,
      };
    }

    // ====================================================
    // 11. INTENT: FARM_QUERY / DATABASE_ACTION (Deep Domain Engine)
    // ====================================================
    let enrichedQuery = cleanQuery;
    if (context.lastBatchId || memory.currentBatch) {
      const activeB = memory.currentBatch || context.lastBatchId;
      if (q.includes('its') || q.includes('it ') || q.includes('this batch') || q.includes('that batch') || q.includes('same batch')) {
        enrichedQuery = cleanQuery.replace(/\b(?:its|it|this batch|that batch|same batch)\b/gi, activeB!);
      }
      this.engine.setLastBatch(memory.currentBatchId || context.lastBatchId!);
    }

    const engineMsg = this.engine.processQuery(enrichedQuery, history);

    let nextState: ConversationState = 'IDLE';
    let pendingAction: ActionProposal | null = null;
    let waitingForField: 'category' | 'batch' | 'amount' | null = null;

    if (engineMsg.actionProposal && engineMsg.actionProposal.status === 'pending') {
      nextState = 'WAITING_FOR_CONFIRMATION';
      pendingAction = engineMsg.actionProposal;
    } else if (engineMsg.clarificationOptions) {
      nextState = 'WAITING_FOR_INFORMATION';
      waitingForField = engineMsg.clarificationOptions.field;
      const amtMatch = cleanQuery.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)/i);
      if (amtMatch) {
        pendingAction = {
          type: 'create_expense',
          title: `Pending Expense`,
          details: {
            amount: parseFloat(amtMatch[1].replace(/,/g, '')),
          },
          status: 'pending',
        };
      }
    }

    return {
      message: engineMsg,
      nextState,
      intent,
      pendingAction,
      waitingForField,
      lastBatchId: this.engine.getLastBatch() || context.lastBatchId,
      handledDirectly: false,
      sessionMemory: memory,
    };
  }
}
