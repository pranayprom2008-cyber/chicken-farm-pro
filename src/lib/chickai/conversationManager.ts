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
  ActionProposal
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

    // 6. Check for Confirmation / Approval
    const confirmPhrases = [
      'yes', 'yeah', 'yep', 'do it', 'go ahead', 'confirm', 'save it', 'okay', 'ok',
      'proceed', 'sure', 'save', 'please do', 'yes please', 'yes save it', 'yes do it',
      'affirmative', 'correct', 'that is correct', 'right', 'all good', 'looks good'
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
        q.includes('change amount') ||
        q.includes('instead') ||
        q.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})*|\d+)/) ||
        q.includes('batch')
      ) {
        return 'CHANGE_REQUEST';
      }
    }

    // 7. Check for Slot filling when waiting for information
    if (context.state === 'WAITING_FOR_INFORMATION' && context.waitingForField) {
      return 'CORRECT';
    }

    // 8. General conversational queries
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
      q.includes('update')
    ) {
      return 'DATABASE_ACTION';
    }

    return 'FARM_QUERY';
  }

  /**
   * Process a conversational turn with full state machine transitions
   */
  public process(
    rawQuery: string,
    context: ConversationContext,
    history: ChickAIMessage[] = []
  ): ConversationProcessResult {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleanQuery = rawQuery.trim();
    const intent = this.classifyIntent(cleanQuery, context);

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
      };
    }

    // ====================================================
    // 6. INTENT: CONFIRM (Execute Pending Action)
    // ====================================================
    if (intent === 'CONFIRM' && context.pendingAction) {
      const proposal = context.pendingAction;
      let text = '✅ *Confirmed and saved to your database.*';

      if (proposal.type === 'create_expense') {
        const { amount, category, batchNumber } = proposal.details;
        text = `Done! I've recorded the **₹ ${amount?.toLocaleString('en-IN')}** ${category} expense for **${batchNumber || 'General Farm'}** to your database.`;
      } else if (proposal.type === 'update_expense') {
        const { newAmount, category } = proposal.details;
        text = `Done! The ${category} expense has been updated to **₹ ${newAmount?.toLocaleString('en-IN')}**.`;
      } else if (proposal.type === 'delete_expense') {
        const { amount, category } = proposal.details;
        text = `Done! Removed the **₹ ${amount?.toLocaleString('en-IN')}** (${category}) expense from your records.`;
      } else if (proposal.type === 'add_mortality') {
        const { deadChicks, feedConsumed, averageWeight, batchNumber } = proposal.details;
        if (averageWeight && averageWeight > 0) {
          text = `Done! Logged **${averageWeight} kg** average bird weight telemetry for **${batchNumber}**.`;
        } else if (deadChicks && deadChicks > 0) {
          text = `Done! Recorded **${deadChicks} mortality** for **${batchNumber}**.`;
        } else {
          text = `Done! Recorded **${feedConsumed} kg feed consumption** for **${batchNumber}**.`;
        }
      } else if (proposal.type === 'create_sale') {
        const { chickensSold, totalRevenue } = proposal.details;
        text = `Done! Recorded commercial sale of **${chickensSold} birds** (Total: ₹ ${(totalRevenue || 0).toLocaleString('en-IN')}).`;
      } else if (proposal.type === 'create_task') {
        text = `Done! Scheduled task **"${proposal.details.taskTitle}"** on your farm agenda.`;
      }

      return {
        message: {
          id: `act-${Date.now()}`,
          sender: 'assistant',
          text,
          timestamp: timeStr,
          actionProposal: {
            ...proposal,
            status: 'confirmed',
          },
        },
        nextState: 'ACTION_COMPLETED',
        intent: 'CONFIRM',
        pendingAction: null,
        lastBatchId: proposal.details.batchId || context.lastBatchId,
        handledDirectly: true,
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
          text: '↩️ *Okay, I\'ve cancelled that.* No changes were made to your farm database.',
          timestamp: timeStr,
        },
        nextState: 'CANCELLED',
        intent: 'CANCEL',
        pendingAction: null,
        waitingForField: null,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
      };
    }

    // ====================================================
    // 8. INTENT: CHANGE_REQUEST / CORRECTION
    // ====================================================
    if (intent === 'CHANGE_REQUEST' && context.pendingAction) {
      const q = cleanQuery.toLowerCase();
      const proposal = { ...context.pendingAction };
      const details = { ...proposal.details };

      // Check for amount correction (e.g. "Actually make that 1500", "Make it 2000 instead")
      const amtMatch = cleanQuery.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)/i);
      if (amtMatch && amtMatch[1]) {
        const newAmt = parseFloat(amtMatch[1].replace(/,/g, ''));
        if (!isNaN(newAmt) && newAmt > 0) {
          details.amount = newAmt;
          proposal.title = `Save ₹${newAmt.toLocaleString('en-IN')} ${details.category || 'Expense'}`;
        }
      }

      // Check for batch correction (e.g. "Actually make it Batch 44", "No, Batch 43")
      const batchNumMatch = cleanQuery.match(/\b(?:batch\s*#?|b-?)(\d+)\b/i);
      if (batchNumMatch && batchNumMatch[1]) {
        const targetBNum = `Batch-${batchNumMatch[1]}`;
        const foundBatch = this.farmSnapshot.batches.find((b) => b.batchNumber.toLowerCase().includes(batchNumMatch[1]));
        if (foundBatch) {
          details.batchId = foundBatch.id;
          details.batchNumber = foundBatch.batchNumber;
        } else {
          details.batchNumber = targetBNum;
        }
      }

      // Check for category correction
      const cats = ['Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Transportation', 'Chicks', 'Other'];
      for (const cat of cats) {
        if (q.includes(cat.toLowerCase())) {
          details.category = cat;
          proposal.title = `Save ₹${(details.amount || 0).toLocaleString('en-IN')} ${cat} Expense`;
          break;
        }
      }

      proposal.details = details;

      return {
        message: {
          id: `mod-${Date.now()}`,
          sender: 'assistant',
          text: `Got it! I've updated the proposal:\n\n• **Amount:** ₹ ${(details.amount || 0).toLocaleString('en-IN')}\n• **Category:** ${details.category || 'Expense'}\n• **Target:** ${details.batchNumber || 'General Farm'}\n\nShould I save this to your database?`,
          timestamp: timeStr,
          actionProposal: proposal,
        },
        nextState: 'WAITING_FOR_CONFIRMATION',
        intent: 'CHANGE_REQUEST',
        pendingAction: proposal,
        lastBatchId: details.batchId || context.lastBatchId,
        handledDirectly: true,
      };
    }

    // ====================================================
    // 9. INTENT: MISSING INFORMATION (Slot Filling)
    // ====================================================
    if (context.state === 'WAITING_FOR_INFORMATION' && context.waitingForField === 'category') {
      const q = cleanQuery.toLowerCase();
      let selectedCat = 'Other';
      if (q.includes('feed')) selectedCat = 'Feed';
      else if (q.includes('med') || q.includes('vacc')) selectedCat = 'Medicine';
      else if (q.includes('elec') || q.includes('power')) selectedCat = 'Electricity';
      else if (q.includes('labour') || q.includes('labor') || q.includes('salary')) selectedCat = 'Labour';
      else if (q.includes('maint') || q.includes('repair') || q.includes('husk')) selectedCat = 'Maintenance';
      else if (q.includes('diesel') || q.includes('fuel') || q.includes('trans')) selectedCat = 'Transportation';

      const amount = context.pendingAction?.details?.amount || 1000;
      const targetBatch = context.pendingAction?.details?.batchNumber || 'General Farm';

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
          text: `I'll add **₹ ${amount.toLocaleString('en-IN')}** as a **${selectedCat}** expense for **${targetBatch}**.\n\nShould I save this to your database?`,
          timestamp: timeStr,
          actionProposal: newProposal,
        },
        nextState: 'WAITING_FOR_CONFIRMATION',
        intent: 'CORRECT',
        pendingAction: newProposal,
        waitingForField: null,
        lastBatchId: context.lastBatchId,
        handledDirectly: true,
      };
    }

    // ====================================================
    // 10. INTENT: GENERAL CONVERSATION
    // ====================================================
    if (intent === 'GENERAL_CONVERSATION') {
      const q = cleanQuery.toLowerCase();
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
      };
    }

    // ====================================================
    // 11. INTENT: FARM_QUERY / DATABASE_ACTION (Deep Domain Engine)
    // ====================================================
    // Resolve Pronouns: If user says "What about its expenses?" or "How is it doing?"
    let enrichedQuery = cleanQuery;
    if (context.lastBatchId) {
      const bObj = this.farmSnapshot.batches.find((b) => b.id === context.lastBatchId || b.batchNumber === context.lastBatchId);
      if (bObj && (cleanQuery.includes('its') || cleanQuery.includes('it ') || cleanQuery.includes('this batch') || cleanQuery.includes('that batch'))) {
        enrichedQuery = cleanQuery.replace(/\b(?:its|it|this batch|that batch)\b/gi, bObj.batchNumber);
      }
      this.engine.setLastBatch(context.lastBatchId);
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
      // Stash partial proposal
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
    };
  }
}
