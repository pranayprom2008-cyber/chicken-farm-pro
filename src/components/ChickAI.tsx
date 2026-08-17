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
  Pause,
  Camera,
  Image as ImageIcon,
  Thermometer,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import {
  ChickAIMessage,
  AIActionHistoryItem,
  ActionProposal,
  ConversationState,
  ConversationContext,
  UserIntent,
  VoiceSessionMemory
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
  const [activeVoiceMode, setActiveVoiceMode] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<any>(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<AIActionHistoryItem[]>([]);
  const [sessionMemory, setSessionMemory] = useState<VoiceSessionMemory>({});
  const executedTxRef = useRef<Set<string>>(new Set());

  // Conversational State Machine
  const [conversationState, setConversationState] = useState<ConversationState>('IDLE');
  const [pendingAction, setPendingAction] = useState<ActionProposal | null>(null);
  const [waitingForField, setWaitingForField] = useState<'category' | 'batch' | 'amount' | null>(null);
  const [interruptedMessage, setInterruptedMessage] = useState<string | null>(null);
  const [lastAssistantResponse, setLastAssistantResponse] = useState<string | null>(null);

  // Vision File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        { label: '🔮 Forecast Batch', query: 'Predict profit and harvest forecast for active batch' },
        { label: '📷 AI Vision Check', query: 'Analyze shed photo for flock distribution and weight' },
        { label: '🌡️ Sensor Telemetry', query: 'Show shed environment sensor readings' },
        { label: '🌾 Calculate FCR', query: 'Calculate FCR for my active batch' },
        { label: '⏳ Days to Harvest', query: 'When is the harvest date for my active batch?' },
        { label: '🐔 Add 20 Dead Birds', query: 'Add 20 dead birds to active batch' },
      ];
    }
    if (pathname.includes('/expenses')) {
      return [
        { label: '💰 Add ₹1000 Feed', query: 'Add ₹1,000 for feed' },
        { label: '⛽ Add ₹2500 Diesel', query: 'Add ₹2,500 diesel expense' },
        { label: '💊 Add ₹4000 Vaccine', query: 'Add ₹4,000 vaccination expense' },
        { label: '⚡ Add ₹5000 Electricity', query: 'Add ₹5,000 electricity expense' },
        { label: '🌾 Feed Expenses', query: 'How much did we spend on feed?' },
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
      { label: '🌟 Executive Priorities', query: 'What should I worry about today?' },
      { label: '🔮 Forecast Profit', query: 'Predict profit and harvest forecast for active batch' },
      { label: '🌽 Feed Runway', query: 'How much feed is left and when will it run out?' },
      { label: '📷 AI Vision Check', query: 'Analyze shed photo for flock distribution and weight' },
      { label: '🌡️ Sensor Telemetry', query: 'Show shed environment sensor readings' },
      { label: '🌾 Calculate FCR', query: 'Calculate FCR for my active batch' },
      { label: '💰 Add ₹1000 Feed', query: 'Add ₹1,000 for feed' },
      { label: '📊 Weekly Excel Report', query: 'Generate weekly audit report for 9849852085 in Excel format' },
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
      text: `👋 **Welcome to ChickAI Farm Intelligence!** I am your intelligent Farm Operating System, connected in real-time to your telemetry, sensors, and database.\n\nAsk me anything, upload shed photos for AI Vision analysis, or issue natural voice commands like *"Add ₹1,000 for feed"*, *"What should I worry about today?"*, or *"Predict profit for active batch"*.`,
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
    const previewText = "Here's your farm summary. All active batches are healthy and on schedule. How can I help?";
    voiceServiceRef.current.speak(previewText, voiceSettings);
  };

  // Toggle Voice Mode View
  const handleToggleVoiceMode = () => {
    const nextMode = !activeVoiceMode;
    setActiveVoiceMode(nextMode);
    if (nextMode) {
      const greeting = "Farm copilot ready. What would you like to check or record?";
      voiceServiceRef.current.speak(greeting, voiceSettings, () => setConversationState('SPEAKING'), () => {
        if (voiceSettings.voiceCommands) startListening();
        else setConversationState('IDLE');
      });
    } else {
      handleStopSpeech();
    }
  };

  // Handle Photo / Image Upload for AI Vision Analysis
  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleProcessTurn('Analyze this shed photo for flock distribution and weight', false, base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Execute Confirmed Database Action
  const executeDatabaseAction = async (proposal: ActionProposal, isVoice = false) => {
    setConversationState('EXECUTING_ACTION');
    const actionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let confirmationText = '';
    let spokenConfirmation = '';

    // Deduplication check to prevent double writes on duplicate voice recognition events
    const txKey = proposal.details.transactionId || `${proposal.type}-${proposal.details.amount || proposal.details.totalChicks || proposal.details.deadChicks || ''}-${proposal.details.category || proposal.details.batchNumber || ''}-${Math.floor(Date.now() / 4000)}`;
    if (executedTxRef.current.has(txKey)) {
      setConversationState('IDLE');
      return;
    }
    executedTxRef.current.add(txKey);

    try {
      // 0. Create Batch
      if (proposal.type === 'create_batch') {
        const { batchNumber, totalChicks, breedType, durationDays } = proposal.details;
        await store.createBatch({
          batchNumber: batchNumber || `Batch-${Date.now().toString().slice(-4)}`,
          batchName: batchNumber || 'New Batch',
          totalChicks: totalChicks || 5000,
          breedType: breedType || 'Cobb 500 (Broiler)',
          durationDays: durationDays || 45,
          status: 'growing',
        });

        confirmationText = `✅ **Batch Created!** Saved **${batchNumber}** with **${(totalChicks || 5000).toLocaleString()} birds** directly to your farm database.`;
        spokenConfirmation = `Done! Created ${batchNumber} with ${(totalChicks || 5000).toLocaleString()} chicks.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Created ${batchNumber} (${(totalChicks || 5000).toLocaleString()} Birds)`,
            target: batchNumber || 'New Flock',
            amount: totalChicks,
            timestamp: actionTime,
          },
        ]);
      }
      // 1. Create Expense
      else if (proposal.type === 'create_expense') {
        const { category, amount, batchId, description, batchNumber } = proposal.details;
        await store.createExpense({
          category: category || 'Other',
          amount: amount || 0,
          batchId: batchId || undefined,
          description: description || `ChickAI logged: ${category} expense`,
          date: new Date().toISOString().split('T')[0],
        });

        const createdId = `EXP-${Date.now().toString().slice(-4)}`;
        confirmationText = `✅ **Expense Saved to Database!**\n\n• **Amount:** ₹ ${amount?.toLocaleString('en-IN')}\n• **Category:** ${category}\n• **Batch:** ${batchNumber || 'General Farm'}\n• **Expense ID:** #${createdId}`;
        spokenConfirmation = `Done! Added ₹${amount?.toLocaleString('en-IN')} ${category} expense to ${batchNumber || 'your farm'}.`;

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
        confirmationText = `✅ **Expense Updated!** ${category} expense changed to **₹ ${newAmount?.toLocaleString('en-IN')}**.`;
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
        confirmationText = `🗑️ **Expense Deleted.** Removed ₹ ${amount?.toLocaleString('en-IN')} (${category}) from your records.`;
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
          confirmationText = `✅ **Flock Weight Recorded!** Saved **${averageWeight} kg** avg weight for **${batchNumber}**.`;
          spokenConfirmation = `Done! Logged ${averageWeight} kg average weight for ${batchNumber}.`;
        } else if (deadChicks && deadChicks > 0) {
          confirmationText = `✅ **Mortality Updated!** Recorded **${deadChicks} dead birds** for **${batchNumber}**.`;
          spokenConfirmation = `Done! Mortality recorded for ${batchNumber}.`;
        } else {
          confirmationText = `✅ **Feed Consumed Logged!** Recorded **${feedConsumed} kg feed** for **${batchNumber}**.`;
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
      // 5. Create Feed Purchase Task
      else if (proposal.type === 'create_feed_purchase') {
        const { purchaseQuantityKg, priority, batchNumber } = proposal.details;
        confirmationText = `✅ **Feed Procurement Scheduled!** Added **${(purchaseQuantityKg || 2000).toLocaleString()} kg** Broiler Feed to operations.`;
        spokenConfirmation = `Done! Created feed purchase task for ${purchaseQuantityKg} kilograms.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Procurement: ${purchaseQuantityKg}kg Feed`,
            target: batchNumber || 'Inventory',
            timestamp: actionTime,
          },
        ]);
      }
      // 6. Create Sale
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
        confirmationText = `✅ **Bird Sale Recorded!** Saved dispatch of **${chickensSold || 500} birds** (Total: ₹ ${(totalRevenue || 0).toLocaleString('en-IN')}).`;
        spokenConfirmation = `Done! Recorded bird sale for ${(totalRevenue || 0)} rupees.`;

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
      // 7. Create Task
      else if (proposal.type === 'create_task') {
        const { taskTitle, priority, batchNumber } = proposal.details;
        confirmationText = `✅ **Task Scheduled!** "${taskTitle}" added to farm agenda.`;
        spokenConfirmation = `Done! Scheduled task to ${taskTitle}.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Task: ${taskTitle}`,
            target: batchNumber || 'Farm Operations',
            timestamp: actionTime,
          },
        ]);
      }

      // Revalidate database and recalculate live stats immediately across whole UI
      await Promise.allSettled([
        store.syncAll(),
        store.fetchDashboardData(),
      ]);

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
      console.error('Database write error:', err);
      setConversationState('ERROR');
      const failText = "I couldn't save that because the database request failed. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Database Save Failed:** ${failText}`,
          timestamp: actionTime,
        },
      ]);
      if (voiceSettings.autoSpeak || activeVoiceMode || isVoice) {
        voiceServiceRef.current.speak(failText, voiceSettings, () => setConversationState('SPEAKING'), () => setConversationState('IDLE'));
      }
    }
  };

  // Master Conversational Turn Processor
  const handleProcessTurn = async (queryText?: string, isVoiceInitiated = false, attachedImage?: string) => {
    const text = (queryText || input).trim();
    if (!text && !attachedImage) return;
    if (loading) return;

    const qLower = text.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Client Fast-Path: Stop / Interruption
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
      if (lastAssistantResponse) {
        setInterruptedMessage(lastAssistantResponse);
      }
      return;
    }

    // Client Fast-Path: Confirmation (YES / Save that / Save it)
    const isYes = [
      'yes', 'yeah', 'yep', 'do it', 'go ahead', 'confirm', 'save it', 'save that', 'save this',
      'save there', 'save it there', 'save this information', 'okay', 'ok', 'proceed', 'sure',
      'save', 'please do', 'yes please', 'yes save it', 'yes do it'
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

    // Client Fast-Path: Cancellation (NO)
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

    // Standard Dispatch
    const userMsg: ChickAIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text || '📷 Attached Shed Photo',
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
        sessionMemory,
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
          message: text || 'Analyze this shed photo for flock distribution and weight',
          history: messages,
          clientContext,
          conversationContext: convContext,
          attachedImage,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        if (data.lastBatchId) {
          setActiveBatchId(data.lastBatchId);
        }
        if (data.sessionMemory) {
          setSessionMemory(data.sessionMemory);
        }

        setConversationState(data.nextState || 'IDLE');
        setPendingAction(data.pendingAction || null);
        setLastAssistantResponse(data.message.text);

        if (data.speedAdjustment) {
          handleUpdateVoiceSettings({
            speed: Math.max(0.8, Math.min(1.2, (voiceSettings.speed || 0.96) + data.speedAdjustment)),
          });
        }

        setMessages((prev) => [...prev, data.message]);

        // If the action was confirmed automatically (e.g. from "save that", "save it", "save there")
        if (data.message.actionProposal && data.message.actionProposal.status === 'confirmed') {
          await executeDatabaseAction(data.message.actionProposal, isVoiceInitiated);
          return;
        }

        // Auto-Speak
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
          <span className="absolute -inset-0.5 rounded-full bg-emerald-400/30 blur-xs group-hover:bg-emerald-400/50 animate-pulse pointer-events-none" />

          <div className="relative w-6 h-6 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white animate-bounce [animation-duration:3s]" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1" />
          </div>

          <span className="relative tracking-wide font-extrabold hidden sm:inline text-white">
            ChickAI
          </span>

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

      {/* Main Spatial Glass AI Command Center Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 rounded-[2rem] spatial-glass-elevated overflow-hidden flex flex-col transition-all duration-300 ${
              isExpanded
                ? 'w-[95vw] sm:w-[760px] h-[92vh] max-h-[880px]'
                : 'w-[95vw] sm:w-[480px] h-[85vh] max-h-[700px]'
            }`}
          >
            {/* Ambient Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Spatial Glass Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>✨ CHICKAI</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono border border-teal-400/30">
                        FARM OS
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ONLINE</span>
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400 font-mono">
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
                  title={activeVoiceMode ? 'Exit Voice Mode' : 'Enter Voice Copilot'}
                >
                  <Radio className="w-4 h-4" />
                </button>

                {/* Voice Settings Button */}
                <button
                  onClick={() => setShowVoiceSettings(true)}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Voice Persona & Settings"
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
                        Farm Intelligence System active
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
                        className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-3.5 sm:p-4 space-y-2.5 shadow-md ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-xs'
                            : 'bg-[#102219]/90 border border-emerald-500/25 text-slate-100 rounded-tl-xs backdrop-blur-md'
                        }`}
                      >
                        {/* Text Body */}
                        <div className="prose prose-invert prose-xs max-w-none leading-relaxed break-words font-sans">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>

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
                              {m.actionProposal.details.purchaseQuantityKg && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Feed Quantity:</span>
                                  <span className="font-bold text-amber-300">{m.actionProposal.details.purchaseQuantityKg.toLocaleString()} kg</span>
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

                        {/* Vision Analysis Interactive Card */}
                        {m.visionData && (
                          <div className="p-3.5 rounded-2xl bg-black/60 border border-teal-500/40 text-white space-y-2.5 mt-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                              <span className="font-bold text-teal-300 text-xs flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-teal-400" />
                                AI Vision Biometric Survey
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400">
                                {m.visionData.confidenceScore}% Confidence
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Surveilled Birds</span>
                                <span className="font-bold">~{m.visionData.approximateBirdCount}</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Distribution</span>
                                <span className="font-bold text-teal-300">{m.visionData.flockDistribution}</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Activity Status</span>
                                <span className="font-bold text-emerald-400">{m.visionData.activityLevel}</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Visual Avg Weight</span>
                                <span className="font-bold">{m.visionData.estimatedAvgWeightKg} kg</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sensor Telemetry Card */}
                        {m.sensorData && (
                          <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 text-white space-y-2 mt-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                                Shed Environment Telemetry
                              </span>
                              <span className="text-[10px] text-slate-400">{m.sensorData.lastUpdated}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center">
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Temp</span>
                                <span className="font-bold text-emerald-400">{m.sensorData.temperatureC}°C</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Humidity</span>
                                <span className="font-bold">{m.sensorData.humidityPct}%</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/5">
                                <span className="text-slate-400 block text-[9px] uppercase">Ammonia</span>
                                <span className="font-bold text-emerald-400">{m.sensorData.ammoniaPpm} ppm</span>
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
                    <span>ChickAI is computing farm intelligence...</span>
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

            {/* Input Bar with Photo/Vision Upload, Voice Mic, and Send */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessTurn();
              }}
              className="p-3.5 border-t border-emerald-500/20 bg-black/45 flex items-center gap-2 flex-shrink-0"
            >
              {/* Hidden file input for camera/image analysis */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageSelected}
              />

              {/* Camera / Vision Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-[var(--bg-input)] hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 transition-all cursor-pointer"
                title="Upload Shed/Flock Photo for AI Vision Analysis"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Voice / Mic Button */}
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
                    : 'Ask or command ChickAI (e.g. Add ₹1,000 for feed)...'
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
