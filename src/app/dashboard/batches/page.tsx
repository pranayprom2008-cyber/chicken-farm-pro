'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore, Batch } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import {
  Bird,
  Plus,
  Edit2,
  Trash2,
  Skull,
  Calendar,
  Layers,
  Search,
  Filter,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  Wheat,
  Scale,
  Syringe,
  Award
} from 'lucide-react';
import TiltCard from '@/components/TiltCard';
import { motion, AnimatePresence } from 'framer-motion';
import FlockCalendar from '@/components/FlockCalendar';

const emptyBatchForm = {
  batchNumber: '',
  batchName: '',
  breedType: 'Cobb 500 (Broiler)',
  totalChicks: 5000,
  deadChicks: 0,
  durationDays: 45,
  startDate: new Date().toISOString().split('T')[0],
  expectedEndDate: '',
  status: 'growing' as 'growing' | 'completed' | 'sold',
  notes: '',
};

export default function BatchesPage() {
  const {
    theme,
    batches,
    loading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    createDailyRecord,
    syncAll,
  } = useFarmStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDailyRecordModal, setShowDailyRecordModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBatchForSchedule, setSelectedBatchForSchedule] = useState<Batch | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBatchForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Quick Daily Log
  const [dailyDead, setDailyDead] = useState<number>(0);
  const [dailyFeed, setDailyFeed] = useState<number>(0);
  const [dailyWeight, setDailyWeight] = useState<number>(0);
  const [dailyNotes, setDailyNotes] = useState<string>('');

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';

  useEffect(() => {
    fetchBatches();
    syncAll();
  }, [fetchBatches, syncAll]);

  const safeBatches = Array.isArray(batches) ? batches : [];

  const filteredBatches = safeBatches.filter((b) => {
    if (!b) return false;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const batchNum = b.batchNumber || '';
    const batchName = b.batchName || '';
    const breed = b.breedType || '';
    const matchesSearch =
      batchNum.toLowerCase().includes(search.toLowerCase()) ||
      batchName.toLowerCase().includes(search.toLowerCase()) ||
      breed.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    const nextNum = `B-${new Date().getFullYear()}-${String(safeBatches.length + 1).padStart(2, '0')}`;
    setForm({
      ...emptyBatchForm,
      batchNumber: nextNum,
      startDate: new Date().toISOString().split('T')[0],
    });
    setModalError(null);
    setShowCreateModal(true);
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setModalError(null);

    const batchNum = form.batchNumber.trim() || `B-${new Date().getFullYear()}-${String(safeBatches.length + 1).padStart(2, '0')}`;
    const chicksCount = Number(form.totalChicks);

    if (chicksCount <= 0) {
      setModalError('Total chicks count must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    const res = await createBatch({
      ...form,
      batchNumber: batchNum,
      totalChicks: chicksCount,
      deadChicks: Number(form.deadChicks) || 0,
      durationDays: Number(form.durationDays) || 45,
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowCreateModal(false);
      setForm(emptyBatchForm);
      await syncAll();
    } else {
      setModalError(res.error || 'Failed to create batch in database');
    }
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedBatchId) return;
    setModalError(null);

    setIsSubmitting(true);
    const res = await updateBatch(selectedBatchId, {
      ...form,
      totalChicks: Number(form.totalChicks),
      deadChicks: Number(form.deadChicks) || 0,
      durationDays: Number(form.durationDays) || 45,
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowEditModal(false);
      setSelectedBatchId(null);
      await syncAll();
    } else {
      setModalError(res.error || 'Failed to update batch');
    }
  };

  const openEditModal = (batch: Batch) => {
    setSelectedBatchId(batch.id);
    setForm({
      batchNumber: batch.batchNumber || '',
      batchName: batch.batchName || '',
      breedType: batch.breedType || 'Cobb 500 (Broiler)',
      totalChicks: batch.totalChicks || 0,
      deadChicks: batch.deadChicks || 0,
      durationDays: batch.durationDays || 45,
      startDate: batch.startDate ? batch.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expectedEndDate: batch.expectedEndDate ? batch.expectedEndDate.split('T')[0] : '',
      status: batch.status || 'growing',
      notes: batch.notes || '',
    });
    setModalError(null);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, batchNumber: string) => {
    if (confirm(`Are you sure you want to delete batch ${batchNumber}? All related records will be removed.`)) {
      await deleteBatch(id);
      await syncAll();
    }
  };

  const handleDailyRecord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedBatchId) return;

    setIsSubmitting(true);
    const res = await createDailyRecord({
      batchId: selectedBatchId,
      deadChicks: Number(dailyDead),
      feedConsumed: Number(dailyFeed),
      averageWeight: Number(dailyWeight),
      notes: dailyNotes,
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowDailyRecordModal(false);
      setDailyDead(0);
      setDailyFeed(0);
      setDailyWeight(0);
      setDailyNotes('');
      setSelectedBatchId(null);
      await syncAll();
    }
  };

  const formatSafeDate = (dStr?: string | null, includeYear = false) => {
    if (!dStr) return '—';
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        ...(includeYear ? { year: 'numeric' } : {}),
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Batch Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Batch Management
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Monitor flocks, track mortality, and manage 45-day broiler grow-out cycles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedBatchForSchedule(safeBatches.find((b) => b?.status === 'growing') || safeBatches[0] || null);
              setShowScheduleModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">45-Day Vaccine Protocol</span>
            <span className="sm:hidden">Schedule</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              isLiquid
                ? 'bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-500 hover:opacity-90 shadow-violet-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Batch</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by batch number, name, or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'growing', 'completed', 'sold'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? isLiquid
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500 text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={statusFilter + search}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {filteredBatches.length === 0 ? (
            <div
              className={`p-12 text-center rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
                isLiquid ? 'liquid-panel' : ''
              }`}
            >
              <Bird className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-40 mb-3" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">No Batches Found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {safeBatches.length === 0
                  ? 'Start by creating your first poultry batch to track birds, feed, and mortality.'
                  : 'No batches matched your search filter.'}
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Batch</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBatches.map((batch) => {
                const startFormatted = formatSafeDate(batch.startDate);
                const endFormatted = formatSafeDate(batch.expectedEndDate, true);

                return (
                  <TiltCard key={batch.id || batch.batchNumber} maxTilt={6} glare={true}>
                    <div
                      className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col justify-between transition-all duration-300 h-full ${
                        isLiquid ? 'liquid-panel hover:border-cyan-500/40' : 'shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Top Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-extrabold text-[var(--text-primary)]">
                                {batch.batchNumber || 'Batch'}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  batch.status === 'growing'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : batch.status === 'completed'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {batch.status || 'growing'}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium line-clamp-1">
                              {batch.batchName || batch.breedType || 'Broiler'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(batch)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                              title="Edit Batch"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(batch.id, batch.batchNumber || 'Batch')}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Growth Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                            <span>Day {batch.daysElapsed || 1} of {batch.durationDays || 45}</span>
                            <span className="font-semibold text-cyan-400">{batch.growthProgress || 0}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, batch.growthProgress || 0))}%` }}
                            />
                          </div>
                        </div>

                        {/* Biometric Numbers Grid */}
                        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[var(--bg-input)] mb-4 text-center">
                          <div>
                            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase block">Total</span>
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {(batch.totalChicks || 0).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase block">Alive</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {(batch.aliveChicks || 0).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase block">Dead</span>
                            <span className="text-sm font-bold text-rose-400">
                              {(batch.deadChicks || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Date and Financial Metrics */}
                        <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <Calendar className="w-3.5 h-3.5" /> Start - Harvest:
                            </span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {startFormatted} – {endFormatted}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <DollarSign className="w-3.5 h-3.5" /> Total Cost:
                            </span>
                            <span className="font-bold text-[var(--text-primary)]">
                              ₹ {(batch.totalExpenditure || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <Scale className="w-3.5 h-3.5" /> Cost / Chick:
                            </span>
                            <span className="font-bold text-emerald-400">
                              ₹ {(batch.costPerChick || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedBatchForSchedule(batch);
                            setShowScheduleModal(true);
                          }}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>45-Day Vaccine Plan</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            setShowDailyRecordModal(true);
                          }}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Daily Entry</span>
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal: Create Batch */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Poultry Batch"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                required
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Batch Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Shed 1 Monsoon Flock"
                value={form.batchName}
                onChange={(e) => setForm({ ...form, batchName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Breed Type
              </label>
              <select
                value={form.breedType}
                onChange={(e) => setForm({ ...form, breedType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="Cobb 500 (Broiler)">Cobb 500 (Broiler)</option>
                <option value="Ross 308 (Broiler)">Ross 308 (Broiler)</option>
                <option value="Hubbard (Broiler)">Hubbard (Broiler)</option>
                <option value="BV 300 (Layer)">BV 300 (Layer)</option>
                <option value="Country Chicken (Desi)">Country Chicken (Desi)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Total Chicks Stocked *
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.totalChicks}
                onChange={(e) => setForm({ ...form, totalChicks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Placement Start Date *
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Cycle Duration (Days)
              </label>
              <input
                type="number"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
              Notes & Batch Details
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Hatchery source, initial weight, chick box condition..."
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Batch */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Poultry Batch"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Batch Number
              </label>
              <input
                type="text"
                required
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="growing">Growing (Active)</option>
                <option value="completed">Completed</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Total Chicks Placed
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.totalChicks}
                onChange={(e) => setForm({ ...form, totalChicks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Dead Chicks (Mortality)
              </label>
              <input
                type="number"
                min="0"
                value={form.deadChicks}
                onChange={(e) => setForm({ ...form, deadChicks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Daily Log Record */}
      <Modal
        isOpen={showDailyRecordModal}
        onClose={() => setShowDailyRecordModal(false)}
        title="Add Daily Batch Log Entry"
      >
        <form onSubmit={handleDailyRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Dead Chicks Today
              </label>
              <input
                type="number"
                min="0"
                value={dailyDead}
                onChange={(e) => setDailyDead(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Feed Consumed (kg)
              </label>
              <input
                type="number"
                min="0"
                value={dailyFeed}
                onChange={(e) => setDailyFeed(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Avg Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={dailyWeight}
                onChange={(e) => setDailyWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
              Observation / Notes
            </label>
            <input
              type="text"
              placeholder="Flock active, water chlorination checked, litter dry..."
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDailyRecordModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Save Daily Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: 45-Day Vaccine Protocol */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="45-Day Poultry Health & Vaccine Schedule"
        size="lg"
      >
        <FlockCalendar batch={selectedBatchForSchedule || undefined} />
      </Modal>
    </div>
  );
}
