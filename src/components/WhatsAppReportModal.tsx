'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, Copy, Check, Send, PhoneCall, ShieldCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import { useFarmStore } from '@/store/useFarmStore';

interface WhatsAppReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppReportModal({ isOpen, onClose }: WhatsAppReportModalProps) {
  const { stats, batches, settings, theme } = useFarmStore();
  const [copied, setCopied] = useState(false);

  const activeBatch = batches.find((b) => b.status === 'growing') || batches[0];
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalChicks = stats.totalChicks || (activeBatch ? activeBatch.totalChicks : 5000);
  const aliveChicks = stats.aliveChicks || (activeBatch ? activeBatch.aliveChicks : 4880);
  const deadChicks = stats.deadChicks || (activeBatch ? activeBatch.deadChicks : 120);
  const mortalityPct = stats.mortalityPercentage || (activeBatch ? activeBatch.mortalityPercentage : 2.4);
  const totalRev = stats.totalRevenue || 0;
  const totalExp = stats.totalExpenditure || 0;
  const netProfit = stats.netRealizedProfit || (totalRev - totalExp);

  // Pre-formatted clean WhatsApp message
  const reportMessage = `🐔 *${settings.farmName || 'Greenfield Poultry Farm'}*
📅 *Daily Farm Executive Report • ${todayStr}*
────────────────────────
🐥 *Flock Telemetry:*
• Active Batch: *${activeBatch?.batchNumber || 'Batch-01'} (${activeBatch?.breedType || 'Broiler Cobb 500'})*
• Total Flock Placed: *${totalChicks.toLocaleString()} birds*
• Alive Birds in Shed: *${aliveChicks.toLocaleString()} birds*
• Total Mortality: *${deadChicks.toLocaleString()} birds (${mortalityPct}% - ${mortalityPct <= 3 ? 'Normal' : 'High Alert'})*
• Est. Feed Consumed: *${stats.feedConsumed.toLocaleString()} kg*
• Est. Feed in Stock: *${stats.feedRemaining.toLocaleString()} kg*

💰 *Financial Snapshot:*
• Total Revenue (Sales): *₹ ${totalRev.toLocaleString('en-IN')}*
• Total Farm Expenses: *₹ ${totalExp.toLocaleString('en-IN')}*
• Realized Net Profit: *₹ ${netProfit.toLocaleString('en-IN')}*

👑 *Authorized Farm Admins:*
• Owner: *John (9502828293)*
• Manager & Tech: *Pranay (9849852085)*
────────────────────────
Generated via *ChickFarm Pro Commercial OS*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const openWhatsApp = (phone?: string) => {
    const encoded = encodeURIComponent(reportMessage);
    const url = phone
      ? `https://wa.me/91${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📱 WhatsApp Executive Summary Dispatch" size="md">
      <div className="space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">
          Instantly dispatch a real-time commercial farm report to the farm owner or WhatsApp group.
        </p>

        {/* Message Preview Box */}
        <div className="p-4 rounded-2xl bg-[#0F1E16] dark:bg-[#07130C] border border-emerald-500/30 text-emerald-100 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-60 overflow-y-auto selection:bg-emerald-500/40">
          {reportMessage}
        </div>

        {/* Quick Send Options */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Direct Dispatch to Authorized Admins
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => openWhatsApp('9502828293')}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send to John (Owner)</span>
            </button>

            <button
              onClick={() => openWhatsApp('9849852085')}
              className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send to Pranay (Tech)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => openWhatsApp()}
              className="px-4 py-3 rounded-2xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Any WhatsApp Contact / Group</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-3 rounded-2xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
