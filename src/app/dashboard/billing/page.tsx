'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore, BillingRecord } from '@/store/useFarmStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  Calculator,
  Sparkles,
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Activity,
  CheckCircle,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';

import TiltCard from '@/components/TiltCard';

export default function BillingPage() {
  const {
    theme,
    batches,
    billingHistory,
    fetchBillingHistory,
    createBillingCalculation,
    deleteBillingCalculation,
  } = useFarmStore();

  // Calculator modes
  const [calcMode, setCalcMode] = useState<'chick' | 'feed' | 'fcr' | 'medicine'>('chick');

  // Chick Purchase Calculator state
  const [chickRate, setChickRate] = useState<string>('');
  const [numberOfChicks, setNumberOfChicks] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Feed Calculator state
  const [feedBags, setFeedBags] = useState<string>('');
  const [feedBagPrice, setFeedBagPrice] = useState<string>('');

  // FCR Calculator state
  const [fcrFeedTotalKg, setFcrFeedTotalKg] = useState<string>('');
  const [fcrWeightTotalKg, setFcrWeightTotalKg] = useState<string>('');

  // Medicine Dosage state
  const [medBirds, setMedBirds] = useState<string>('');
  const [medDosagePerBird, setMedDosagePerBird] = useState<string>('');
  const [medCostPerLitre, setMedCostPerLitre] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';

  useEffect(() => {
    fetchBillingHistory();
  }, [fetchBillingHistory]);

  // Calculations
  const numChicks = parseFloat(numberOfChicks) || 0;
  const rateChick = parseFloat(chickRate) || 0;
  const chickTotalAmount = numChicks * rateChick;

  const numFeedBags = parseFloat(feedBags) || 0;
  const bagPrice = parseFloat(feedBagPrice) || 0;
  const feedTotalAmount = numFeedBags * bagPrice;

  const fcrFeed = parseFloat(fcrFeedTotalKg) || 0;
  const fcrWeight = parseFloat(fcrWeightTotalKg) || 0;
  const fcrScore = fcrWeight > 0 ? (fcrFeed / fcrWeight).toFixed(2) : '0.00';

  const numMedBirds = parseFloat(medBirds) || 0;
  const dosageMl = parseFloat(medDosagePerBird) || 0;
  const costLitre = parseFloat(medCostPerLitre) || 0;
  const totalMedLitres = (numMedBirds * dosageMl) / 1000;
  const medTotalAmount = totalMedLitres * costLitre;

  // Active calculated amount
  let currentTotal = 0;
  if (calcMode === 'chick') currentTotal = chickTotalAmount;
  else if (calcMode === 'feed') currentTotal = feedTotalAmount;
  else if (calcMode === 'fcr') currentTotal = parseFloat(fcrScore) || 0;
  else if (calcMode === 'medicine') currentTotal = medTotalAmount;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: isLiquid ? ['#00E5FF', '#8B5CF6', '#10B981', '#F59E0B'] : ['#10B981', '#34D399', '#FBBF24'],
      });
    } catch {
      // ignore
    }
  };

  const handleSaveToHistory = async () => {
    if (currentTotal <= 0 && calcMode !== 'fcr') return;
    setSaving(true);
    setSuccessMsg('');

    let payload: Partial<BillingRecord> = {
      type:
        calcMode === 'chick'
          ? 'chick_purchase'
          : calcMode === 'feed'
          ? 'feed_purchase'
          : calcMode === 'fcr'
          ? 'fcr_calculation'
          : 'medicine_calculation',
      totalAmount: currentTotal,
      batchId: selectedBatchId || null,
      notes: notes || undefined,
    };

    if (calcMode === 'chick') {
      payload.chickRate = rateChick;
      payload.numberOfChicks = numChicks;
      payload.notes = notes || `Chick Purchase: ${numChicks.toLocaleString()} birds @ ₹${rateChick}/unit`;
    } else if (calcMode === 'feed') {
      payload.feedBags = numFeedBags;
      payload.notes = notes || `Feed Purchase: ${numFeedBags} bags @ ₹${bagPrice}/bag`;
    } else if (calcMode === 'fcr') {
      payload.fcrScore = parseFloat(fcrScore);
      payload.notes = notes || `FCR: Feed ${fcrFeed}kg / Weight ${fcrWeight}kg = ${fcrScore}`;
    } else if (calcMode === 'medicine') {
      payload.notes = notes || `Medicine: ${totalMedLitres.toFixed(2)}L for ${numMedBirds} birds`;
    }

    const res = await createBillingCalculation(payload);
    setSaving(false);
    if (res.success) {
      triggerCelebration();
      setSuccessMsg('Calculation saved to database history!');
      setTimeout(() => setSuccessMsg(''), 3500);
      setNotes('');
    }
  };

  const exportHistoryCSV = () => {
    if (!billingHistory || billingHistory.length === 0) return;
    const headers = ['Type', 'Amount (₹)', 'Date', 'Batch', 'Notes'];
    const rows = billingHistory.map((item) => [
      item.type,
      item.totalAmount,
      new Date(item.createdAt).toLocaleDateString(),
      item.batch?.batchNumber || 'General',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chickfarm_billing_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'chick', label: 'Chick Purchase', icon: '🐣' },
    { id: 'feed', label: 'Feed Calculator', icon: '🌾' },
    { id: 'fcr', label: 'FCR Analysis', icon: '⚖️' },
    { id: 'medicine', label: 'Medicine Dosage', icon: '💊' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Billing & Farm Calculator
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Calculate chick purchase costs, feed requirements, and FCR efficiency metrics
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs with Fluid Sliding Pill */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] w-fit relative">
        {tabs.map((tab) => {
          const isActive = calcMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCalcMode(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative select-none ${
                isActive
                  ? isLiquid
                    ? 'text-cyan-300'
                    : 'text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBillingTabPill"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className={`absolute inset-0 rounded-xl ${
                    isLiquid
                      ? 'bg-cyan-500/20 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                  }`}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Calculator Card */}
        <div className="lg:col-span-6">
          <TiltCard maxTilt={8} glare={true}>
            <div
              className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
                isLiquid ? 'liquid-panel' : 'shadow-sm'
              }`}
            >
            {/* Card Title & Sparkle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    isLiquid
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Quick Calculator
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Enter details to compute total in real time
                  </p>
                </div>
              </div>
              <Sparkles
                className={`w-5 h-5 ${isLiquid ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'}`}
              />
            </div>

            {/* Inputs based on active mode */}
            <div className="space-y-4">
              {calcMode === 'chick' && (
                <>
                  {/* Chick Rate (per unit) */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Chick Rate (per unit)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-semibold">
                        ₹
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={chickRate}
                        onChange={(e) => setChickRate(e.target.value)}
                        placeholder="Enter rate per chick (e.g. 38)"
                        className="w-full pl-9 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Number of Chicks */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Number of Chicks
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-semibold">
                        #
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={numberOfChicks}
                        onChange={(e) => setNumberOfChicks(e.target.value)}
                        placeholder="Enter quantity (e.g. 5000)"
                        className="w-full pl-9 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {calcMode === 'feed' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Number of Feed Bags (50kg each)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-semibold">
                        #
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={feedBags}
                        onChange={(e) => setFeedBags(e.target.value)}
                        placeholder="Enter number of bags (e.g. 100)"
                        className="w-full pl-9 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Price Per Bag (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-semibold">
                        ₹
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={feedBagPrice}
                        onChange={(e) => setFeedBagPrice(e.target.value)}
                        placeholder="e.g. 2150"
                        className="w-full pl-9 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {calcMode === 'fcr' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Total Feed Consumed (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fcrFeedTotalKg}
                      onChange={(e) => setFcrFeedTotalKg(e.target.value)}
                      placeholder="e.g. 15400"
                      className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Total Weight Gained / Harvested (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fcrWeightTotalKg}
                      onChange={(e) => setFcrWeightTotalKg(e.target.value)}
                      placeholder="e.g. 9800"
                      className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {calcMode === 'medicine' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Number of Birds
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={medBirds}
                        onChange={(e) => setMedBirds(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full px-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Dosage (ml/bird)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={medDosagePerBird}
                        onChange={(e) => setMedDosagePerBird(e.target.value)}
                        placeholder="e.g. 0.2"
                        className="w-full px-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Cost per Litre (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={medCostPerLitre}
                      onChange={(e) => setMedCostPerLitre(e.target.value)}
                      placeholder="e.g. 1400"
                      className="w-full px-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl text-sm focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Optional Batch Selection & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Assign to Batch (Optional)
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">-- None (General) --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} - {b.batchName || b.breedType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Notes / Tag
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Cobb 500 First Lift"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Amount Green Container matching user screenshot */}
              <motion.div
                layout
                className={`mt-6 p-6 rounded-3xl text-center border transition-all duration-300 ${
                  isLiquid
                    ? 'bg-cyan-950/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-emerald-950/30 dark:bg-emerald-950/60 border-emerald-500/20 shadow-md'
                }`}
              >
                <span className="text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase block mb-1">
                  {calcMode === 'fcr' ? 'FEED CONVERSION RATIO (FCR)' : 'TOTAL AMOUNT'}
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-black tracking-tight my-1 ${
                    isLiquid ? 'text-cyan-300' : 'text-white dark:text-emerald-300'
                  }`}
                >
                  {calcMode === 'fcr' ? (
                    <span>{fcrScore}</span>
                  ) : (
                    <AnimatedCounter value={currentTotal} prefix="₹ " />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                  {currentTotal > 0 || calcMode === 'fcr'
                    ? calcMode === 'fcr'
                      ? parseFloat(fcrScore) > 0 && parseFloat(fcrScore) <= 1.6
                        ? '🌟 Excellent Broiler Efficiency'
                        : parseFloat(fcrScore) > 1.6
                        ? '⚠️ Higher feed conversion ratio'
                        : 'Enter values above'
                      : 'Live computation ready'
                    : 'Enter values above to see the total'}
                </p>
              </motion.div>

              {/* Save Button matching screenshot */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSaveToHistory}
                disabled={saving || (currentTotal <= 0 && calcMode !== 'fcr')}
                className={`w-full mt-4 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all shadow-lg ${
                  isLiquid
                    ? 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 shadow-cyan-500/25'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                } ${
                  currentTotal <= 0 && calcMode !== 'fcr'
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {saving ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>+ Save to History</span>
                  </>
                )}
              </motion.button>

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </div>
          </div>
          </TiltCard>
        </div>

        {/* Right Column: Billing History matching screenshot */}
        <div className="lg:col-span-6">
          <div
            className={`p-6 sm:p-7 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isLiquid
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Billing History
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {billingHistory.length} calculations recorded
                  </p>
                </div>
              </div>

              {billingHistory.length > 0 && (
                <button
                  onClick={exportHistoryCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {/* List of saved calculations */}
            {billingHistory.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-2xl">
                <Receipt className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">No saved calculations yet.</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Perform a calculation on the left and click &quot;Save to History&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {billingHistory.map((item) => {
                    const formattedDate = new Date(item.date || item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] transition-all flex items-center justify-between gap-3 ${
                          isLiquid ? 'hover:border-cyan-500/40' : 'hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                item.type === 'chick_purchase'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : item.type === 'feed_purchase'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : item.type === 'fcr_calculation'
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                  : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              }`}
                            >
                              {item.type.replace('_', ' ')}
                            </span>
                            {item.batch && (
                              <span className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {item.batch.batchNumber}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1 font-medium">
                            {item.notes || 'Calculation record'}
                          </p>

                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                            {item.type === 'fcr_calculation'
                              ? `FCR ${item.fcrScore || item.totalAmount}`
                              : `₹ ${item.totalAmount.toLocaleString()}`}
                          </span>

                          <button
                            onClick={() => deleteBillingCalculation(item.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Calculation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
