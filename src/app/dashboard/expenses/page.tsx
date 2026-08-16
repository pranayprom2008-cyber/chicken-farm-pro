'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore, Expense } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Filter,
  Download,
  DollarSign,
  Wheat,
  Pill,
  Zap,
  Users,
  Wrench,
  HelpCircle
} from 'lucide-react';

const CATEGORIES = ['All', 'Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Miscellaneous'];

const emptyExpense = {
  category: 'Feed',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  batchId: '',
};

export default function ExpensesPage() {
  const {
    expenses,
    fetchExpenses,
    createExpense,
    deleteExpense,
    batches,
    settings,
    theme,
  } = useFarmStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyExpense);
  const [saving, setSaving] = useState(false);

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';
  const currency = settings.currency || '₹';

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = activeCategory === 'All' || e.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesBatch = selectedBatchFilter === 'all' || e.batchId === selectedBatchFilter;
    return matchesCat && matchesBatch;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    const res = await createExpense({
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      date: form.date,
      batchId: form.batchId || undefined,
    });
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setForm(emptyExpense);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('feed') || cat.includes('food')) return <Wheat className="w-4 h-4 text-amber-400" />;
    if (cat.includes('med') || cat.includes('vacc')) return <Pill className="w-4 h-4 text-violet-400" />;
    if (cat.includes('elec') || cat.includes('power')) return <Zap className="w-4 h-4 text-cyan-400" />;
    if (cat.includes('lab') || cat.includes('work')) return <Users className="w-4 h-4 text-emerald-400" />;
    if (cat.includes('maint') || cat.includes('repair')) return <Wrench className="w-4 h-4 text-rose-400" />;
    return <HelpCircle className="w-4 h-4 text-gray-400" />;
  };

  const exportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ['Category', 'Description', 'Amount (₹)', 'Date', 'Batch'];
    const rows = filteredExpenses.map((e) => [
      e.category,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.amount,
      new Date(e.date).toLocaleDateString(),
      e.batch?.batchNumber || 'General',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `chickfarm_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Expense Management
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Log and audit all production costs with automatic category summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredExpenses.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}

          <button
            onClick={() => {
              setForm(emptyExpense);
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-md ${
              isLiquid
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-violet-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div
        className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <div>
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
            Total Filtered Expenditures ({activeCategory})
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            {currency} {totalFilteredAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {filteredExpenses.length} recorded item{filteredExpenses.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchNumber} ({b.batchName || b.breedType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? isLiquid
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-500 text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expense Items List */}
      {filteredExpenses.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
            isLiquid ? 'liquid-panel' : ''
          }`}
        >
          <Wallet className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-40 mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No expense records found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Record a new expense to track farm production costs.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${
            isLiquid ? 'liquid-panel' : 'shadow-sm'
          }`}
        >
          <div className="divide-y divide-[var(--border-color)]">
            {filteredExpenses.map((expense) => {
              const formattedDate = new Date(expense.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={expense.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isLiquid ? 'hover:bg-white/[0.02]' : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isLiquid ? 'bg-white/[0.04]' : 'bg-[var(--bg-input)]'
                      }`}
                    >
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {expense.description}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--bg-input)] text-[var(--text-secondary)]">
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        {expense.batch && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Layers className="w-3 h-3" />
                            {expense.batch.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-rose-400 whitespace-nowrap">
                      - {currency} {expense.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Delete this expense record?')) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Farm Expense"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                >
                  <option value="Feed">Feed</option>
                  <option value="Medicine">Medicine & Vaccines</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Labour">Labour & Wages</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Description *
              </label>
              <input
                type="text"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Brooder Heating Gas & Nipple Line Disinfectant"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Associated Batch
                </label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                >
                  <option value="">-- General Farm Expense --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} - {b.batchName || b.breedType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
              >
                {saving ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
