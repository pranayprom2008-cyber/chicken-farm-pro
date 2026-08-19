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
    syncAll,
  } = useFarmStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyExpense);
  const [saving, setSaving] = useState(false);

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';
  const currency = settings?.currency || '₹';

  useEffect(() => {
    fetchExpenses();
    syncAll();
  }, [fetchExpenses, syncAll]);

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeBatches = Array.isArray(batches) ? batches : [];

  const filteredExpenses = safeExpenses.filter((e) => {
    if (!e) return false;
    const cat = e.category || '';
    const matchesCat = activeCategory === 'All' || cat.toLowerCase() === activeCategory.toLowerCase();
    const matchesBatch = selectedBatchFilter === 'all' || e.batchId === selectedBatchFilter;
    return matchesCat && matchesBatch;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0);

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
      await syncAll();
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
      await syncAll();
    }
  };

  const getCategoryIcon = (category?: string) => {
    const cat = (category || '').toLowerCase();
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
    const rows = filteredExpenses.map((e) => {
      const batchObj = safeBatches.find((b) => b?.id === e.batchId);
      const safeDate = e.date ? new Date(e.date).toLocaleDateString() : '—';
      return [
        e.category || 'General',
        `"${(e.description || '').replace(/"/g, '""')}"`,
        e.amount || 0,
        safeDate,
        batchObj ? batchObj.batchNumber : 'General Farm',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Expenditure & Feed Ledger
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Track feed purchases, medications, electricity units, and farm maintenance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              isLiquid
                ? 'bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-500 hover:opacity-90 shadow-violet-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Batch Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? isLiquid
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500 text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="all">All Batches</option>
            {safeBatches.map((b) => (
              <option key={b?.id || Math.random()} value={b?.id}>
                {b?.batchNumber} ({b?.breedType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Total Filtered Summary Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Filtered Total Expenditure ({filteredExpenses.length} entries)
            </span>
            <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
              {currency} {totalFilteredAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-40 mb-3" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">No Expenses Recorded</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add your feed invoices, vaccines, electricity bills, or farm repairs to see live cost breakdowns.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-input)]/50 border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredExpenses.map((exp) => {
                  const bObj = safeBatches.find((b) => b?.id === exp.batchId);
                  const safeDate = exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

                  return (
                    <tr key={exp.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(exp.category)}
                          <span>{exp.category || 'General'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono text-[11px]">
                        {bObj ? bObj.batchNumber : 'General Farm'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)] whitespace-nowrap">
                        {safeDate}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-400 whitespace-nowrap">
                        - {currency} {(exp.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Expense */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Farm Expense"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="Feed">Feed (Broiler Starter / Finisher)</option>
              <option value="Medicine">Medicine & Vaccines</option>
              <option value="Electricity">Electricity & Energy</option>
              <option value="Labour">Labour & Staff Wages</option>
              <option value="Maintenance">Maintenance & Repairs</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 15000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
              Allocate to Batch (Optional)
            </label>
            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="">General Farm Cost (Not tied to specific batch)</option>
              {safeBatches.map((b) => (
                <option key={b?.id || Math.random()} value={b?.id}>
                  {b?.batchNumber} ({b?.breedType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
              Description / Vendor / Item Details *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. 50 bags Pre-starter feed from Godrej Agrovet..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all flex items-center gap-1.5"
            >
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
