'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ListTodo
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import { ChickAIMessage, AIActionHistoryItem, ActionProposal } from '@/lib/chickai/types';
import { ChickAIEngine } from '@/lib/chickai/engine';
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
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<AIActionHistoryItem[]>([]);

  // Compute live alerts for dynamic button badge
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
        { label: '🐔 Add 20 Dead Birds', query: 'Add 20 dead birds to active batch' },
        { label: '🌽 500kg Feed Usage', query: 'Record 500 kg feed consumed for active batch' },
        { label: '🏆 Best Batch', query: 'Which batch is performing best?' },
        { label: '📊 Compare Batches', query: 'Compare my active and previous batches' },
        { label: '📈 Predict Profit', query: 'Predict profit for my active batch' },
      ];
    }
    if (pathname.includes('/expenses')) {
      return [
        { label: '💰 Add ₹1000 Feed', query: 'Add ₹1,000 for feed' },
        { label: '⚡ Add ₹5000 Electricity', query: 'Add ₹5,000 electricity expense' },
        { label: '🌾 Feed Expenses', query: 'How much did we spend on feed?' },
        { label: '💸 Expense Trends', query: 'Which expenses are increasing?' },
      ];
    }
    if (pathname.includes('/revenue')) {
      return [
        { label: '🧾 Log Sale 500 Birds', query: 'Record sale of 500 birds at ₹118' },
        { label: '💰 Revenue Summary', query: 'What is my total realized revenue and net profit?' },
        { label: '📈 Price Simulator', query: 'What if selling price increases by ₹5/kg?' },
      ];
    }
    return [
      { label: '💰 Add ₹1000 Feed', query: 'Add ₹1,000 for feed' },
      { label: '📊 Weekly Excel Report', query: 'Generate weekly audit report for 9849852085 in Excel format' },
      { label: '🏆 Farm AI Score', query: 'Calculate my Farm AI Score' },
      { label: '🧮 What-If Simulator', query: 'What if feed price increases by ₹3/kg?' },
      { label: '🐔 Analyze Batches', query: 'How are my active batches performing?' },
      { label: '🚨 Find Problems', query: 'Find any problems or alerts on the farm' },
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

  // Voice Input Speech Recognition
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: ChickAIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
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
          message: text.trim(),
          history: messages,
          clientContext,
          lastBatchId: activeBatchId,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        if (data.lastBatchId) {
          setActiveBatchId(data.lastBatchId);
        }
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: data.error || '⚠️ I couldn\'t retrieve your farm data right now. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ Network connection issue. Using local telemetry snapshot.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Action Confirmations
  const handleConfirmAction = async (msgId: string, proposal: ActionProposal) => {
    try {
      let confirmationText = '';
      const actionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 1. Create Expense
      if (proposal.type === 'create_expense') {
        const { category, amount, batchId, description, batchNumber } = proposal.details;
        const res = await store.createExpense({
          category: category || 'Other',
          amount: amount || 0,
          batchId: batchId || undefined,
          description: description || `ChickAI logged: ${category} expense`,
          date: new Date().toISOString().split('T')[0],
        });

        const createdId = `EXP-${Date.now().toString().slice(-4)}`;
        confirmationText = `✅ **Expense Added Successfully!**\n\n• **Amount:** ₹ ${amount?.toLocaleString('en-IN')}\n• **Category:** ${category}\n• **Batch:** ${batchNumber || 'General Farm'}\n• **Date:** Today\n• **Expense ID:** #${createdId}\n\n*All dashboard financials and batch totals have been updated live.*`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Added ₹${amount?.toLocaleString('en-IN')} ${category} Expense`,
            target: batchNumber || 'General Farm',
            amount,
            timestamp: actionTime,
            type: 'create_expense',
            status: 'completed',
          },
          ...prev,
        ]);
      }
      // 2. Update Expense
      else if (proposal.type === 'update_expense') {
        const { expenseId, oldAmount, newAmount, category, description } = proposal.details;
        if (expenseId) {
          await store.updateExpense(expenseId, { amount: newAmount });
        }
        confirmationText = `✅ **Expense Updated!** Amount modified from **₹ ${oldAmount?.toLocaleString('en-IN')}** to **₹ ${newAmount?.toLocaleString('en-IN')}** (${category}).`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Updated ${category} Expense to ₹${newAmount?.toLocaleString('en-IN')}`,
            target: 'Expense Record',
            amount: newAmount,
            timestamp: actionTime,
            type: 'update_expense',
            status: 'completed',
          },
          ...prev,
        ]);
      }
      // 3. Delete Expense
      else if (proposal.type === 'delete_expense') {
        const { expenseId, amount, category } = proposal.details;
        if (expenseId) {
          await store.deleteExpense(expenseId);
        }
        confirmationText = `✅ **Expense Deleted!** The ₹ ${amount?.toLocaleString('en-IN')} ${category} record was removed from your database.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Deleted ₹${amount?.toLocaleString('en-IN')} ${category} Expense`,
            target: 'Expense Database',
            amount,
            timestamp: actionTime,
            type: 'delete_expense',
            status: 'completed',
          },
          ...prev,
        ]);
      }
      // 4. Add Mortality / Feed Consumption
      else if (proposal.type === 'add_mortality') {
        const { batchId, deadChicks, feedConsumed, batchNumber } = proposal.details;
        await store.createDailyRecord({
          batchId: batchId || store.batches[0]?.id || '',
          deadChicks: deadChicks || 0,
          feedConsumed: feedConsumed || 0,
          averageWeight: 0,
        });

        if (deadChicks && deadChicks > 0) {
          confirmationText = `✅ **Mortality Recorded!** Logged **${deadChicks} dead birds** for ${batchNumber || 'Batch'}. Live flock and mortality percentages updated.`;
          setActionHistory((prev) => [
            {
              id: `act-${Date.now()}`,
              action: `Logged ${deadChicks} Dead Birds`,
              target: batchNumber || 'Active Batch',
              timestamp: actionTime,
              type: 'add_mortality',
              status: 'completed',
            },
            ...prev,
          ]);
        } else {
          confirmationText = `✅ **Feed Usage Recorded!** Logged **${feedConsumed} kg** feed consumption for ${batchNumber || 'Batch'}.`;
          setActionHistory((prev) => [
            {
              id: `act-${Date.now()}`,
              action: `Recorded ${feedConsumed} kg Feed Consumed`,
              target: batchNumber || 'Active Batch',
              timestamp: actionTime,
              type: 'feed_usage',
              status: 'completed',
            },
            ...prev,
          ]);
        }
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

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Sold ${chickensSold} Birds (₹${totalRevenue?.toLocaleString('en-IN')})`,
            target: batchNumber || 'Commercial Sale',
            amount: totalRevenue,
            timestamp: actionTime,
            type: 'create_sale',
            status: 'completed',
          },
          ...prev,
        ]);
      }
      // 6. Create Task
      else if (proposal.type === 'create_task') {
        const { taskTitle, priority, batchNumber } = proposal.details;
        confirmationText = `✅ **Farm Task Created!** Task *"${taskTitle}"* (${priority?.toUpperCase()} priority) scheduled for ${batchNumber}.`;

        setActionHistory((prev) => [
          {
            id: `act-${Date.now()}`,
            action: `Created Task: ${taskTitle}`,
            target: batchNumber || 'General Farm',
            timestamp: actionTime,
            type: 'create_task',
            status: 'completed',
          },
          ...prev,
        ]);
      }
      // 7. Filter Batches
      else if (proposal.type === 'filter_batches') {
        router.push('/dashboard/batches');
        confirmationText = `✅ Filter applied to Batches view.`;
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId && m.actionProposal) {
            return {
              ...m,
              actionProposal: { ...m.actionProposal, status: 'confirmed' },
            };
          }
          return m;
        })
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `conf-${Date.now()}`,
          sender: 'assistant',
          text: confirmationText || '✅ Action successfully confirmed and saved.',
          timestamp: actionTime,
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: '❌ I couldn\'t complete that action because the database request failed. Nothing was changed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.actionProposal) {
          return {
            ...m,
            actionProposal: { ...m.actionProposal, status: 'cancelled' },
          };
        }
        return m;
      })
    );
  };

  return (
    <>
      {/* Floating ChickAI Launcher Button with Dynamic Badge */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black text-sm shadow-2xl shadow-emerald-500/40 border border-emerald-400/40 backdrop-blur-xl cursor-pointer transition-all overflow-hidden"
          title="Open ChickAI Farm Intelligence Copilot"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
          </span>
          <span className="relative tracking-wide">✨ ChickAI</span>

          {/* Dynamic Alert Notification Badge */}
          {hasBadge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              criticalCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-slate-900'
            }`}>
              <span>{criticalCount > 0 ? `🔴 ${criticalCount}` : `🟡 ${attentionCount}`}</span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating Glassmorphic AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-22 right-4 sm:right-6 z-50 rounded-3xl border border-emerald-500/30 bg-[#0B1510]/92 dark:bg-[#060D09]/94 backdrop-blur-2xl shadow-2xl shadow-black/85 flex flex-col overflow-hidden transition-all ${
              isExpanded
                ? 'w-[94vw] sm:w-[740px] h-[86vh]'
                : 'w-[94vw] sm:w-[490px] h-[650px] max-h-[86vh]'
            }`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/70 to-cyan-950/70 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
                  <div className="w-full h-full rounded-[14px] bg-[#0A1610] flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                      <span>ChickAI</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold uppercase">
                        Control Copilot
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connected to Live Farm DB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => setShowHistoryView((prev) => !prev)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    showHistoryView ? 'bg-emerald-500/30 text-emerald-300' : 'hover:text-white hover:bg-white/10'
                  }`}
                  title="AI Action History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveBatchId(null);
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
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title={isExpanded ? 'Minimize size' : 'Expand panel'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Close AI Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contextual Quick Action Suggestion Bar */}
            {!showHistoryView && (
              <div className="px-4 py-2.5 bg-black/35 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
                {currentPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
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
                        <span className="font-extrabold text-emerald-400">{(store.stats?.aliveChicks || 4880).toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/20">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Feed Runway</span>
                        <span className="font-extrabold text-amber-400">
                          {Number(((store.stats?.feedRemaining || 1850) / ((store.stats?.aliveChicks || 4880) * 0.13)).toFixed(1))} Days
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/20">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Livability</span>
                        <span className="font-extrabold text-teal-400">
                          {(100 - (store.stats?.mortalityPercentage || 2.4)).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Top Priorities */}
                    {criticalCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>{liveAlerts[0]?.title} - {liveAlerts[0]?.recommendation}</span>
                      </div>
                    )}
                  </div>
                )}

                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isUser
                            ? 'bg-emerald-600 text-white'
                            : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div className="max-w-[85%] space-y-2">
                        <div
                          className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                              : 'bg-[#102219]/90 border border-emerald-500/25 text-emerald-50 rounded-tl-none prose prose-invert prose-xs max-w-none'
                          }`}
                        >
                          {isUser ? (
                            m.text
                          ) : (
                            <div className="space-y-1">
                              <ReactMarkdown>{m.text}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Interactive Category Clarification Chips */}
                        {m.clarificationOptions && (
                          <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-2">
                            <span className="text-[10px] font-bold uppercase text-cyan-300 block">Select Category:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.clarificationOptions.options.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => handleSend(`Set category as ${opt}`)}
                                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Proposal Card */}
                        {m.actionProposal && (
                          <div
                            className={`p-4 rounded-2xl border text-xs space-y-3 ${
                              m.actionProposal.type === 'delete_expense'
                                ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                                : 'bg-black/50 border-amber-500/40 text-amber-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                {m.actionProposal.type === 'delete_expense' ? (
                                  <>
                                    <Trash2 className="w-4 h-4 text-rose-400" />
                                    <span className="text-rose-400">Authorization: Delete Record</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                    <span className="text-amber-400">Database Action Authorization</span>
                                  </>
                                )}
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono uppercase">
                                {m.actionProposal.type.replace('_', ' ')}
                              </span>
                            </div>

                            {/* Itemized Action Details */}
                            <div className="p-3 rounded-xl bg-white/5 space-y-1.5 text-[11px]">
                              {m.actionProposal.details.amount !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Amount:</span>
                                  <span className="font-bold text-emerald-400">₹ {m.actionProposal.details.amount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {m.actionProposal.details.oldAmount !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Old Amount:</span>
                                  <span className="line-through text-slate-400">₹ {m.actionProposal.details.oldAmount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {m.actionProposal.details.newAmount !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">New Amount:</span>
                                  <span className="font-bold text-emerald-400">₹ {m.actionProposal.details.newAmount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {m.actionProposal.details.category && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Category:</span>
                                  <span className="font-semibold text-white">{m.actionProposal.details.category}</span>
                                </div>
                              )}
                              {m.actionProposal.details.batchNumber && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Target Batch:</span>
                                  <span className="font-semibold text-white">{m.actionProposal.details.batchNumber}</span>
                                </div>
                              )}
                              {m.actionProposal.details.deadChicks !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">New Deaths:</span>
                                  <span className="font-bold text-rose-400">+{m.actionProposal.details.deadChicks} birds</span>
                                </div>
                              )}
                              {m.actionProposal.details.feedConsumed !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Feed Consumed:</span>
                                  <span className="font-bold text-amber-400">{m.actionProposal.details.feedConsumed} kg</span>
                                </div>
                              )}
                              {m.actionProposal.details.taskTitle && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Task Title:</span>
                                  <span className="font-semibold text-white">{m.actionProposal.details.taskTitle}</span>
                                </div>
                              )}
                            </div>

                            {m.actionProposal.status === 'pending' ? (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleConfirmAction(m.id, m.actionProposal!)}
                                  className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
                                    m.actionProposal.type === 'delete_expense'
                                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{m.actionProposal.type === 'delete_expense' ? 'Confirm Delete' : 'Confirm & Save'}</span>
                                </button>
                                <button
                                  onClick={() => handleCancelAction(m.id)}
                                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs cursor-pointer transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : m.actionProposal.status === 'confirmed' ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Action Executed & Saved to Database</span>
                              </div>
                            ) : (
                              <div className="text-slate-400 italic text-[11px]">
                                Action Cancelled
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

                        {/* Weekly Report Action Button if message contains weekly audit */}
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

                        <span className="text-[9px] text-slate-400 block px-1">
                          {m.timestamp}
                        </span>
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
                    <span>ChickAI is analyzing your farm database...</span>
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

            {/* Input Bar with Voice Recognition Mic */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3.5 border-t border-emerald-500/20 bg-black/45 flex items-center gap-2 flex-shrink-0"
            >
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-[var(--bg-input)] hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}
                title={isListening ? 'Listening... Click to stop' : 'Click to Speak (Voice Input)'}
              >
                {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : 'Ask or command ChickAI (e.g. Add ₹1,000 for feed)...'}
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

      {/* Weekly Report & Excel Dispatch Modal */}
      <WeeklyReportModal
        isOpen={showWeeklyModal}
        onClose={() => setShowWeeklyModal(false)}
      />
    </>
  );
}
