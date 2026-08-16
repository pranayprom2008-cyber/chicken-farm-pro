'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Printer,
  ChevronRight,
  Wheat,
  Activity,
  Layers,
  DollarSign,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  FileSpreadsheet,
  Check,
  Mic,
  MicOff,
  Sun,
  AlertTriangle,
  Award,
  ArrowRight,
  Filter,
  History,
  Trash2,
  Edit3,
  Calendar,
  ListTodo,
  Volume2,
  VolumeX,
  Radio,
  Settings,
  Square,
  Clock,
  XCircle,
  Pause
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import {
  ChickAIMessage,
  AIActionHistoryItem,
  ActionProposal,
  ConversationState,
  ConversationContext,
  UserIntent
} from '@/lib/chickai/types';
import { ChickAIEngine } from '@/lib/chickai/engine';
import { ChickAIVoiceService, VoiceSettings, DEFAULT_VOICE_SETTINGS } from '@/lib/chickai/voice';
import ChickAIVoiceVisualizer from '@/components/ChickAIVoiceVisualizer';
import ChickAIVoiceSettings from '@/components/ChickAIVoiceSettings';
import ReactMarkdown from 'react-markdown';
import WeeklyReportModal from '@/components/WeeklyReportModal';

export default function ChickAI() {
  const store = useFarmStore();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [activeVoiceMode, setActiveVoiceMode] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<AIActionHistoryItem[]>([]);

  // Conversational State Machine
  const [conversationState, setConversationState] = useState<ConversationState>('IDLE');
  const [pendingAction, setPendingAction] = useState<ActionProposal | null>(null);
  const [waitingForField, setWaitingForField] = useState<'category' | 'batch' | 'amount' | null>(null);
  const [interruptedMessage, setInterruptedMessage] = useState<string | null>(null);
  const [lastAssistantResponse, setLastAssistantResponse] = useState<string | null>(null);

  // Voice Engine State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chickai_voice_settings');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_VOICE_SETTINGS;
  });

  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const voiceServiceRef = useRef<ChickAIVoiceService>(
    new ChickAIVoiceService((isSpeaking) => {
      if (isSpeaking) {
        setConversationState('SPEAKING');
      } else {
        setConversationState((prev) => (prev === 'SPEAKING' ? 'IDLE' : prev));
      }
    })
  );

  // Dynamic Alert Badge Engine
  const engine = new ChickAIEngine({
    batches: store.batches,
    expenses: store.expenses,
    sales: store.sales,
    billingHistory: store.billingHistory,
    stats: store.stats,
    settings: store.settings,
    currentPath: pathname,
  });

  const liveAlerts = engine.getProactiveAlerts();
  const criticalCount = liveAlerts.filter((a) => a.severity === 'critical').length;
  const attentionCount = liveAlerts.filter((a) => a.severity === 'attention').length;
  const hasBadge = criticalCount > 0 || attentionCount > 0;

  // Contextual Quick Prompts based on Route
  const getContextualPrompts = () => {
    if (pathname.includes('/batches')) {
      return [
        { label: '⚖️ Log 2.1kg Weight', query: 'Record average bird weight 2.1 kg for active batch' },
        { label: '🌾 Calculate FCR', query: 'Calculate FCR for my active batch' },
        { label: '⏳ Days to Harvest', query: 'When is the harvest date for my active batch?' },
        { label: '🐔 Add 20 Dead Birds', query: 'Add 20 dead birds to active batch' },
        { label: '🌽 500kg Feed Usage', query: 'Record 500 kg feed consumed for active batch' },
        { label: '📈 Predict Profit', query: 'Predict profit for my active batch' },
      ];
    }
    if (pathname.includes('/expenses')) {
      return [
        { label: '💰 Add ₹1000 Feed', query: 'Add ₹1,000 for feed' },
        { label: '⛽ Add ₹2500 Diesel', query: 'Add ₹2,500 diesel expense' },
        { label: '💊 Add ₹4000 Vaccine', query: 'Add ₹4,000 vaccination expense' },
        { label: '⚡ Add ₹5000 Electricity', query: 'Add ₹5,000 electricity expense' },
        { label: '🌾 Feed Expenses', query: 'How much did we spend on feed?' },
        { label: '💸 Expense Trends', query: 'Which expenses are increasing?' },
      ];
    }
    if (pathname.includes('/revenue')) {
      return [
        { label: '🎯 Break-Even Price', query: 'What is my break-even price per kg?' },
        { label: '🧾 Log Sale 500 Birds', query: 'Record sale of 500 birds at ₹118' },
        { label: '💰 Revenue Summary', query: 'What is my total realized revenue and net profit?' },
        { label: '📈 Price Simulator', query: 'What if selling price increases by ₹5/kg?' },
      ];
    }
    return [
      { label: '🌾 Calculate FCR', query: 'Calculate FCR for my active batch' },
      { label: '🎯 Break-Even Price', query: 'What is my break-even price per kg?' },
      { label: '⏳ Days to Harvest', query: 'When is harvest date?' },
      { label: '💰 Add ₹1000 Feed', query: 'Add ₹1,000 for feed' },
      { label: '⛽ Add ₹2500 Diesel', query: 'Add ₹2,500 diesel expense' },
      { label: '💧 Water Sanitation', query: 'What chlorine level should I use for drinking water?' },
      { label: '☀️ Morning Farm Brief', query: 'What should I focus on today?' },
      { label: '📊 Weekly Excel Report', query: 'Generate weekly audit report for 9849852085 in Excel format' },
      { label: '🏆 Farm AI Score', query: 'Calculate my Farm AI Score' },
    ];
  };

  const currentPrompts = getContextualPrompts();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '✨ Good Morning';
    if (hour < 17) return '✨ Good Afternoon';
    return '✨ Good Evening';
  };

  const [messages, setMessages] = useState<ChickAIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Welcome to ChickAI!** I am your intelligent Farm Copilot, connected in real-time to your poultry database.\n\nAsk me anything or issue direct commands like *"Add ₹1,000 for feed"*, *"Add 20 dead birds to Batch 45"*, or *"Change the ₹1000 feed expense to ₹1200"*.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, showHistoryView]);

  // Persist voice settings
  const handleUpdateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('chickai_voice_settings', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // Immediate Interruption Handler (Stops audio instantly & preserves state)
  const handleStopSpeech = useCallback(() => {
    voiceServiceRef.current.stop();
    setConversationState('IDLE');
    setVoiceTranscript('');
  }, []);

  // Continuous / Interactive Speech Recognition with Barge-in
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    // If currently speaking, stop audio immediately upon user speaking
    if (voiceServiceRef.current.isSpeaking()) {
      voiceServiceRef.current.stop();
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setConversationState('LISTENING');
        setVoiceTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = finalTranscript || interim;
        setVoiceTranscript(text);

        // Immediate Barge-in: If speaking and any words detected, kill speech immediately!
        if (voiceServiceRef.current.isSpeaking()) {
          voiceServiceRef.current.stop();
        }

        if (finalTranscript) {
          handleProcessTurn(finalTranscript.trim(), true);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice notice:', e);
        setConversationState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
      };

      recognition.onend = () => {
        setConversationState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setConversationState('IDLE');
    }
  }, [pendingAction, voiceSettings, lastAssistantResponse, interruptedMessage]);

  // Test Voice Persona
  const handleTestVoicePersona = () => {
    const previewText = "Hi there! I'm ChickAI, your friendly farm copilot. All your flocks are doing great today. How can I help you?";
    voiceServiceRef.current.speak(previewText, voiceSettings);
  };

  // Toggle Voice Mode View
  const handleToggleVoiceMode = () => {
    const nextMode = !activeVoiceMode;
    setActiveVoiceMode(nextMode);
    if (nextMode) {
      const greeting = "Hi there! I'm ready to help with your farm. What would you like to check or record?";
      voiceServiceRef.current.speak(greeting, voiceSettings, () => setConversationState('SPEAKING'), () => {
        if (voiceSettings.voiceCommands) startListening();
        else setConversationState('IDLE');
      });
    } else {
      handleStopSpeech();
    }
  };

  // Execute Confirmed Database Action
  const executeDatabaseAction = async (proposal: ActionProposal, isVoice = false) => {
    setConversationState('EXECUTING_ACTION');
    const actionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let confirmationText = '';
    let spokenConfirmation = '';

    try {
      // 1. Create Expense
      if (proposal.type === 'create_expense') {
        const { category, amount, batchId, description, batchNumber } = proposal.details;
        await store.createExpense({
          category: category || 'Other',
          amount: amount || 0,
          batchId: batchId || undefined,
          description: description || `ChickAI logged: ${category} expense`,
          date: new Date().toISOString().split('T')[0],
        });

        const createdId = `EXP-${Date.now().toString().slice(-4)}`;
        confirmationText = `✅ **Expense Added Successfully!**\n\n• **Amount:** ₹ ${amount?.toLocaleString('en-IN')}\n• **Category:** ${category}\n• **Batch:** ${batchNumber || 'General Farm'}\n• **Date:** Today\n• **Expense ID:** #${createdId}\n\n*All dashboard financials and batch totals have been updated live.*`;
        spokenConfirmation = `Done! I've added the ${amount} rupee ${category} expense for ${batchNumber || 'your farm'}.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Added ₹${amount?.toLocaleString('en-IN')} ${category} Expense`,
            target: batchNumber || 'General Farm',
            amount,
            timestamp: actionTime,
          },
        ]);
      }
      // 2. Update Expense
      else if (proposal.type === 'update_expense') {
        const { expenseId, newAmount, oldAmount, category, description } = proposal.details;
        if (expenseId) {
          await store.updateExpense(expenseId, {
            amount: newAmount,
            description: `${description || category} (Updated by ChickAI)`,
          });
        }
        confirmationText = `✅ **Expense Modified Successfully!**\n\n• **Category:** ${category}\n• **Previous Amount:** ₹ ${oldAmount?.toLocaleString('en-IN')}\n• **Updated Amount:** **₹ ${newAmount?.toLocaleString('en-IN')}**\n\n*Recalculated all batch expenditures and dashboard charts.*`;
        spokenConfirmation = `Done! The ${category} expense has been updated to ${newAmount} rupees.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Updated ${category} Expense (₹${oldAmount} → ₹${newAmount})`,
            target: 'Expense Ledger',
            amount: newAmount,
            timestamp: actionTime,
          },
        ]);
      }
      // 3. Delete Expense
      else if (proposal.type === 'delete_expense') {
        const { expenseId, amount, category } = proposal.details;
        if (expenseId) {
          await store.deleteExpense(expenseId);
        }
        confirmationText = `🗑️ **Expense Deleted Successfully.** Removed ₹ ${amount?.toLocaleString('en-IN')} (${category}) from your records.`;
        spokenConfirmation = `Done! The ${amount} rupee ${category} expense has been deleted.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Deleted ₹${amount?.toLocaleString('en-IN')} ${category} Expense`,
            target: 'Ledger Cleaned',
            amount,
            timestamp: actionTime,
          },
        ]);
      }
      // 4. Add Mortality / Weight Telemetry
      else if (proposal.type === 'add_mortality') {
        const { batchId, deadChicks, feedConsumed, averageWeight, batchNumber } = proposal.details;
        if (batchId) {
          await store.createDailyRecord({
            batchId,
            deadChicks: deadChicks || 0,
            feedConsumed: feedConsumed || 0,
            averageWeight: averageWeight || 0,
            notes: 'Logged via ChickAI Voice Copilot',
          });
        }

        if (averageWeight && averageWeight > 0) {
          confirmationText = `✅ **Flock Weight Recorded!** Saved **${averageWeight} kg** average bird weight for **${batchNumber}**.`;
          spokenConfirmation = `Done! I've logged ${averageWeight} kg average weight for ${batchNumber}.`;
        } else if (deadChicks && deadChicks > 0) {
          confirmationText = `✅ **Mortality Updated!** Recorded **${deadChicks} dead birds** for **${batchNumber}**.`;
          spokenConfirmation = `Done! I've updated the mortality record for ${batchNumber}.`;
        } else {
          confirmationText = `✅ **Feed Consumed Logged!** Recorded **${feedConsumed} kg feed usage** for **${batchNumber}**.`;
          spokenConfirmation = `Done! Recorded ${feedConsumed} kilos feed usage for ${batchNumber}.`;
        }

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Telemetry Log: ${averageWeight ? `${averageWeight}kg Wt` : `${deadChicks || 0} Dead / ${feedConsumed || 0}kg Feed`}`,
            target: batchNumber || 'Active Flock',
            timestamp: actionTime,
          },
        ]);
      }
      // 5. Create Sale
      else if (proposal.type === 'create_sale') {
        const { batchId, buyer, chickensSold, averageWeight, pricePerKg, totalRevenue, batchNumber } = proposal.details;
        await store.createSaleRecord({
          batchId,
          buyer: buyer || 'Wholesale Trader',
          chickensSold: chickensSold || 500,
          averageWeight: averageWeight || 2.25,
          pricePerKg: pricePerKg || 115,
          saleDate: new Date().toISOString().split('T')[0],
        });
        confirmationText = `✅ **Bird Sale Recorded!** Saved dispatch of **${chickensSold || 500} birds** at ₹${pricePerKg || 115}/kg (Total: ₹ ${(totalRevenue || 0).toLocaleString('en-IN')}).`;
        spokenConfirmation = `Done! I've recorded the sale of ${chickensSold} birds for a total of ${(totalRevenue || 0)} rupees.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Sold ${chickensSold} Birds (₹${(totalRevenue || 0).toLocaleString('en-IN')})`,
            target: batchNumber || 'Commercial Sale',
            amount: totalRevenue,
            timestamp: actionTime,
          },
        ]);
      }
      // 6. Create Task
      else if (proposal.type === 'create_task') {
        const { taskTitle, priority, batchNumber } = proposal.details;
        confirmationText = `✅ **Operational Task Scheduled!**\n\n• **Task:** ${taskTitle}\n• **Priority:** ${priority?.toUpperCase()}\n• **Target:** ${batchNumber}\n\n*Added to your farm daily agenda.*`;
        spokenConfirmation = `Done! I've scheduled the task to ${taskTitle}.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Created Task: ${taskTitle}`,
            target: batchNumber || 'General Farm',
            timestamp: actionTime,
          },
        ]);
      }

      setPendingAction(null);
      setConversationState('ACTION_COMPLETED');

      // Append assistant confirmation message
      const confMsg: ChickAIMessage = {
        id: `conf-${Date.now()}`,
        sender: 'assistant',
        text: confirmationText,
        timestamp: actionTime,
      };
      setMessages((prev) => [...prev, confMsg]);
      setLastAssistantResponse(confirmationText);

      // Speak confirmation if voice is active
      if (voiceSettings.autoSpeak || activeVoiceMode || isVoice) {
        voiceServiceRef.current.speak(spokenConfirmation, voiceSettings, () => setConversationState('SPEAKING'), () => {
          if (activeVoiceMode && voiceSettings.voiceCommands) {
            setTimeout(() => startListening(), 400);
          } else {
            setConversationState('IDLE');
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      setConversationState('ERROR');
      alert('Failed to execute action: ' + err.message);
    }
  };

  // Master Conversational Turn Processor
  const handleProcessTurn = async (queryText?: string, isVoiceInitiated = false) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const qLower = text.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ==========================================================
    // CLIENT FAST-PATH 1: STOP / INTERRUPTION COMMANDS
    // ==========================================================
    if (
      qLower === 'stop' ||
      qLower === 'stop speaking' ||
      qLower === 'stop talking' ||
      qLower === 'be quiet' ||
      qLower === 'shut up' ||
      qLower === 'pause' ||
      qLower === "that's enough" ||
      qLower === 'thats enough' ||
      qLower === 'quiet' ||
      qLower === 'mute'
    ) {
      handleStopSpeech();
      setInput('');
      // Store current response as interrupted message so user can say "Continue"
      if (lastAssistantResponse) {
        setInterruptedMessage(lastAssistantResponse);
      }
      return;
    }

    // ==========================================================
    // CLIENT FAST-PATH 2: CONFIRMATION (YES)
    // ==========================================================
    const isYes = [
      'yes', 'yeah', 'yep', 'do it', 'go ahead', 'confirm', 'save it', 'okay', 'ok',
      'proceed', 'sure', 'save', 'please do', 'yes please', 'yes save it', 'yes do it'
    ].some((p) => qLower === p || qLower.startsWith(`${p} `) || qLower.endsWith(` ${p}`));

    if (isYes && pendingAction) {
      setInput('');
      const userMsg: ChickAIMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, userMsg]);
      await executeDatabaseAction(pendingAction, isVoiceInitiated);
      return;
    }

    // ==========================================================
    // CLIENT FAST-PATH 3: CANCELLATION (NO)
    // ==========================================================
    const isNo = [
      'no', 'nope', 'cancel', "don't", 'dont', 'never mind', 'nevermind', "don't do that",
      'forget it', "don't save", 'reject', 'abort', "no don't", 'actually no'
    ].some((p) => qLower === p || qLower.startsWith(`${p} `) || qLower.endsWith(` ${p}`));

    if (isNo && (pendingAction || conversationState === 'WAITING_FOR_CONFIRMATION' || conversationState === 'WAITING_FOR_INFORMATION')) {
      setInput('');
      setPendingAction(null);
      setWaitingForField(null);
      setConversationState('CANCELLED');

      const userMsg: ChickAIMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: timeStr,
      };
      const cancelMsg: ChickAIMessage = {
        id: `cancel-${Date.now()}`,
        sender: 'assistant',
        text: '↩️ *Okay, I\'ve cancelled that.* No changes were made to your farm database.',
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, userMsg, cancelMsg]);
      setLastAssistantResponse(cancelMsg.text);

      if (voiceSettings.autoSpeak || activeVoiceMode || isVoiceInitiated) {
        voiceServiceRef.current.speak('Okay, I cancelled that.', voiceSettings, () => setConversationState('SPEAKING'), () => {
          setConversationState('IDLE');
        });
      }
      return;
    }

    // ==========================================================
    // STANDARD / BACKEND CONVERSATION ENGINE DISPATCH
    // ==========================================================
    const userMsg: ChickAIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setConversationState('THINKING');

    try {
      const convContext: ConversationContext = {
        state: conversationState,
        lastBatchId: activeBatchId,
        pendingAction,
        waitingForField,
        interruptedMessage,
        lastAssistantResponse,
      };

      const clientContext = {
        batches: store.batches,
        expenses: store.expenses,
        sales: store.sales,
        billingHistory: store.billingHistory,
        stats: store.stats,
        settings: store.settings,
        currentPath: pathname,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          clientContext,
          conversationContext: convContext,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        if (data.lastBatchId) {
          setActiveBatchId(data.lastBatchId);
        }

        setConversationState(data.nextState || 'IDLE');
        setPendingAction(data.pendingAction || null);
        setLastAssistantResponse(data.message.text);

        if (data.speedAdjustment) {
          handleUpdateVoiceSettings({
            speed: Math.max(0.8, Math.min(1.2, (voiceSettings.speed || 1.0) + data.speedAdjustment)),
          });
        }

        setMessages((prev) => [...prev, data.message]);

        // Auto-Speak if enabled or in voice mode
        if (voiceSettings.autoSpeak || activeVoiceMode || isVoiceInitiated) {
          let spokenText = data.resumeAudioText || data.message.text;
          if (data.message.actionProposal && data.message.actionProposal.status === 'pending') {
            spokenText = `I prepared the proposal for ${data.message.actionProposal.title}. Would you like me to save this to your database?`;
          }

          await voiceServiceRef.current.speak(
            spokenText,
            voiceSettings,
            () => setConversationState('SPEAKING'),
            () => {
              if (activeVoiceMode && voiceSettings.voiceCommands) {
                setTimeout(() => startListening(), 350);
              } else {
                setConversationState(data.nextState || 'IDLE');
              }
            }
          );
        } else {
          setConversationState(data.nextState || 'IDLE');
        }
      } else {
        const errorText = data.error || '⚠️ I couldn\'t retrieve your farm data right now. Please try again.';
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: errorText,
            timestamp: timeStr,
          },
        ]);
        setConversationState('ERROR');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ Network connection issue. Telemetry snapshot active.',
          timestamp: timeStr,
        },
      ]);
      setConversationState('ERROR');
    } finally {
      setLoading(false);
    }
  };

  // Get status pill text & color for Header
  const getHeaderStatusIndicator = () => {
    switch (conversationState) {
      case 'LISTENING':
        return { text: '🎙 Listening...', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30 animate-pulse' };
      case 'THINKING':
      case 'EXECUTING_ACTION':
        return { text: '🧠 Thinking...', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' };
      case 'SPEAKING':
        return { text: '🔊 Speaking...', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' };
      case 'WAITING_FOR_CONFIRMATION':
        return { text: '⏳ Waiting for confirmation', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-400/30' };
      case 'WAITING_FOR_INFORMATION':
        return { text: '❓ Waiting for details', color: 'text-amber-300 bg-amber-950/60 border-amber-400/30' };
      case 'ACTION_COMPLETED':
        return { text: '✓ Done', color: 'text-green-400 bg-green-950/60 border-green-500/30' };
      case 'CANCELLED':
        return { text: '↩ Cancelled', color: 'text-slate-400 bg-slate-900/60 border-slate-700/30' };
      case 'IDLE':
      default:
        return { text: '● Ready', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' };
    }
  };

  const statusIndicator = getHeaderStatusIndicator();

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-700/30 flex items-center gap-2.5 border border-emerald-400/40 backdrop-blur-md cursor-pointer transition-all"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-0.5 rounded-full bg-emerald-400/30 blur-xs group-hover:bg-emerald-400/50 animate-pulse pointer-events-none" />

          <div className="relative w-6 h-6 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white animate-bounce [animation-duration:3s]" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1" />
          </div>

          <span className="relative tracking-wide font-extrabold hidden sm:inline text-white">
            ChickAI
          </span>

          {/* Dynamic Alert Badge */}
          {hasBadge && (
            <span
              className={`relative px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                criticalCount > 0
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-400 text-black'
              }`}
            >
              {criticalCount > 0 ? `🔴 ${criticalCount}` : `🟡 ${attentionCount}`}
            </span>
          )}
        </motion.button>
      </div>

      {/* Main Glassmorphism AI Assistant Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 rounded-3xl border border-emerald-500/30 bg-[#09130E]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded
                ? 'w-[95vw] sm:w-[720px] h-[90vh] max-h-[850px]'
                : 'w-[95vw] sm:w-[460px] h-[85vh] max-h-[680px]'
            }`}
          >
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-black/40 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                      ChickAI
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono border border-teal-400/30">
                        Copilot
                      </span>
                    </h3>
                  </div>
                  {/* Real Conversational State Badge */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${statusIndicator.color}`}>
                      {statusIndicator.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                {/* Voice Mode Toggle */}
                <button
                  onClick={handleToggleVoiceMode}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    activeVoiceMode
                      ? 'bg-teal-500/30 text-teal-300 border border-teal-400/50 shadow-md shadow-teal-500/20 animate-pulse'
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                  title={activeVoiceMode ? 'Exit Voice Core Mode' : 'Enter Conversational Voice Mode'}
                >
                  <Radio className="w-4 h-4" />
                </button>

                {/* Voice Settings Button */}
                <button
                  onClick={() => setShowVoiceSettings(true)}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Voice Settings & Persona"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Action History Button */}
                <button
                  onClick={() => setShowHistoryView((prev) => !prev)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    showHistoryView ? 'bg-emerald-500/30 text-emerald-300' : 'hover:text-white hover:bg-white/10'
                  }`}
                  title="AI Action History"
                >
                  <History className="w-4 h-4" />
                </button>

                {/* Reset Conversation */}
                <button
                  onClick={() => {
                    handleStopSpeech();
                    setActiveBatchId(null);
                    setPendingAction(null);
                    setConversationState('IDLE');
                    setMessages([
                      {
                        id: 'welcome',
                        sender: 'assistant',
                        text: `👋 **Welcome back!** Chat history cleared. How can I assist with your farm operations?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ]);
                  }}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title={isExpanded ? 'Minimize size' : 'Expand panel'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    handleStopSpeech();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Close AI Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cinematic Voice Mode Visualizer Display */}
            {activeVoiceMode && (
              <div className="p-4 bg-black/40 border-b border-teal-500/20 flex-shrink-0">
                <ChickAIVoiceVisualizer
                  state={conversationState}
                  onMicClick={conversationState === 'LISTENING' ? () => recognitionRef.current?.stop() : startListening}
                  onStopSpeech={handleStopSpeech}
                  transcript={voiceTranscript}
                  autoSpeak={voiceSettings.autoSpeak}
                />
              </div>
            )}

            {/* Contextual Quick Action Suggestion Bar */}
            {!showHistoryView && (
              <div className="px-4 py-2.5 bg-black/35 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
                {currentPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleProcessTurn(p.query)}
                    className="px-3 py-1.5 rounded-full bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* AI Action History View */}
            {showHistoryView ? (
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <History className="w-4 h-4" />
                    <span>✨ AI Action History (Session Logs)</span>
                  </div>
                  <button
                    onClick={() => setShowHistoryView(false)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Back to Chat
                  </button>
                </div>

                {actionHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <History className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No AI database mutations executed in this session yet.</p>
                    <p className="text-[11px] text-slate-500">Try saying: *"Add ₹1,000 for feed"* or *"Add 20 dead birds to Batch 45"*.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {actionHistory.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{act.action}</span>
                            <span className="text-[10px] text-slate-400">Target: {act.target}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                          {act.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Chat Messages Scrollable View */
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
                {/* Rich AI Home Screen if first turn */}
                {messages.length <= 1 && (
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-black/40 to-cyan-950/20 border border-emerald-500/30 space-y-3.5 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white">{getGreeting()}</span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        Score: {engine.calculateFarmAIScore().overall}/100
                      </span>
                    </div>

                    {/* Active Batches Triage Summary */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/20">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Flock Population</span>
                        <span className="font-black text-white">{store.stats.aliveChicks.toLocaleString()} birds</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/20">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Mortality</span>
                        <span className="font-black text-emerald-400">{store.stats.mortalityPercentage}%</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/20">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Feed Stock</span>
                        <span className="font-black text-amber-300">~{store.stats.feedRemaining} kg</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={handleToggleVoiceMode}
                        className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Start Voice Copilot</span>
                      </button>

                      <span className="text-[10px] text-slate-400 italic">
                        Real conversational AI active
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Stream */}
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-3.5 sm:p-4 space-y-2.5 shadow-md ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-xs'
                            : 'bg-[#102219]/90 border border-emerald-500/25 text-slate-100 rounded-tl-xs backdrop-blur-md'
                        }`}
                      >
                        {/* Text Body */}
                        <div className="prose prose-invert prose-xs max-w-none leading-relaxed break-words font-sans">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>

                        {/* Clarification Chips if AI is asking for missing slot */}
                        {m.clarificationOptions && (
                          <div className="pt-2 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
                              Select {m.clarificationOptions.field}:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.clarificationOptions.options.map((opt: string, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => handleProcessTurn(`Set category as ${opt}`)}
                                  className="px-2.5 py-1 rounded-xl bg-teal-950/80 hover:bg-teal-800 border border-teal-400/40 text-teal-200 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Action Proposal Card */}
                        {m.actionProposal && (
                          <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-400/40 text-white space-y-3 mt-2 shadow-lg">
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                              <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                {m.actionProposal.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {m.actionProposal.status}
                              </span>
                            </div>

                            {/* Proposal Details Table */}
                            <div className="text-[11px] space-y-1 text-slate-300 font-mono">
                              {m.actionProposal.details.amount && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Amount:</span>
                                  <span className="font-bold text-white">₹ {m.actionProposal.details.amount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {m.actionProposal.details.oldAmount && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Old Amount:</span>
                                  <span className="line-through text-slate-400">₹ {m.actionProposal.details.oldAmount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {m.actionProposal.details.category && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Category:</span>
                                  <span className="font-bold text-teal-300">{m.actionProposal.details.category}</span>
                                </div>
                              )}
                              {m.actionProposal.details.batchNumber && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Flock:</span>
                                  <span className="font-bold text-amber-300">{m.actionProposal.details.batchNumber}</span>
                                </div>
                              )}
                            </div>

                            {/* Confirm / Cancel Buttons */}
                            {m.actionProposal.status === 'pending' && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleProcessTurn('cancel')}
                                  className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => executeDatabaseAction(m.actionProposal!)}
                                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirm & Save</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Printable Batch Report Card */}
                        {m.reportData && (
                          <div className="p-4 rounded-2xl bg-black/50 border border-cyan-500/30 text-white space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                              <span className="font-bold text-cyan-300 text-xs">
                                📄 {m.reportData.batchNumber} Executive Overview
                              </span>
                              <button
                                onClick={() => window.print()}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold flex items-center gap-1 hover:bg-cyan-500/30 cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Print / PDF</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Started Flock</span>
                                <span className="font-bold">{m.reportData.started.toLocaleString()} birds</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Alive Count</span>
                                <span className="font-bold text-emerald-400">{m.reportData.alive.toLocaleString()} birds</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Total Cost</span>
                                <span className="font-bold">₹ {m.reportData.totalCost.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Est. Net Profit</span>
                                <span className="font-bold text-emerald-400">₹ {m.reportData.profit.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Weekly Report Action Button */}
                        {m.text.includes('Weekly Farm Executive Audit Report') && (
                          <div className="pt-2">
                            <button
                              onClick={() => setShowWeeklyModal(true)}
                              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-full justify-center"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Download Excel & Send to 9849852085</span>
                            </button>
                          </div>
                        )}

                        {/* Spoken Audio Re-play / Stop Button */}
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                          <span>{m.timestamp}</span>
                          {!isUser && (
                            <div className="flex items-center gap-2">
                              {conversationState === 'SPEAKING' ? (
                                <button
                                  onClick={handleStopSpeech}
                                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer font-bold"
                                  title="Stop speaking"
                                >
                                  <Square className="w-3 h-3 fill-rose-400" />
                                  <span>Stop</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => voiceServiceRef.current.speak(m.text, voiceSettings)}
                                  className="hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Listen to this response"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>Speak</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-[#102219]/70 border border-emerald-500/20 text-emerald-300 text-xs w-fit"
                  >
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>ChickAI is processing farm response...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Bar with Voice Recognition Mic & State-Responsive Controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessTurn();
              }}
              className="p-3.5 border-t border-emerald-500/20 bg-black/45 flex items-center gap-2 flex-shrink-0"
            >
              {conversationState === 'SPEAKING' ? (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/50 shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
                  title="Stop speaking"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={conversationState === 'LISTENING' ? () => recognitionRef.current?.stop() : startListening}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    conversationState === 'LISTENING'
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                      : 'bg-[var(--bg-input)] hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  }`}
                  title={conversationState === 'LISTENING' ? 'Listening... Tap to stop' : 'Click to Speak (Voice Command)'}
                >
                  {conversationState === 'LISTENING' ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  conversationState === 'LISTENING'
                    ? '🔴 Listening to your voice...'
                    : conversationState === 'WAITING_FOR_CONFIRMATION'
                    ? 'Say "Yes" to confirm or "Cancel" to discard...'
                    : 'Ask or speak to ChickAI (e.g. Add ₹1,000 for feed)...'
                }
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-input)] border border-emerald-500/30 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Settings Modal */}
      <ChickAIVoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateVoiceSettings}
        onTestVoice={handleTestVoicePersona}
      />

      {/* Weekly Report & Excel Dispatch Modal */}
      <WeeklyReportModal
        isOpen={showWeeklyModal}
        onClose={() => setShowWeeklyModal(false)}
      />
    </>
  );
}
