"use client";

import { useState } from 'react';
import { useFarmStore, Expense } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import { Plus, Wallet, Trash2, Edit, Calendar } from 'lucide-react';

const emptyExpense = {
  category: 'feed' as Expense['category'],
  description: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  batchId: '',
};

export default function ExpensesPage() {
  const { expenses, settings, theme, addExpense, updateExpense, deleteExpense, batches } = useFarmStore();
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyExpense);

  const isObsidian = theme === 'obsidian';
  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm ${isObsidian ? 'obsidian-glass' : ''}`;
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 ${isObsidian ? 'focus:ring-violet-500/50' : 'focus:ring-emerald-500/50'} transition-all`;
  const btnPrimary = `flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${
    isObsidian ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
  }`;

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const categories = ['All', 'Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Other'];
  
  const filteredExpenses = filter === 'All' ? expenses : expenses.filter(e => e.category.toLowerCase() === filter.toLowerCase());
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyExpense);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setForm({
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      date: exp.date,
      batchId: exp.batchId || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;

    if (editingId) {
      updateExpense(editingId, form);
    } else {
      addExpense(form);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Expense Tracking</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">Record and monitor all operational expenses</p>
        </div>
        <button onClick={handleOpenAdd} className={btnPrimary}>
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary */}
      <div className={`p-6 flex items-center justify-between ${cardClass}`}>
        <div>
          <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Expenses ({filter})</p>
          <h2 className="text-3xl font-bold text-red-500">{formatCurrency(totalExpense)}</h2>
        </div>
        <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 hidden sm:block">
          <Wallet size={32} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200
              ${filter === cat 
                ? (isObsidian ? 'bg-violet-600 text-white' : 'bg-emerald-500 text-white shadow-sm') 
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${cardClass}`}>
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No expenses found for this category.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs">
                <th className="p-4 font-medium rounded-tl-2xl">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Batch</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4 text-[var(--text-secondary)]">{exp.date}</td>
                  <td className="p-4 font-medium text-[var(--text-primary)]">{exp.description}</td>
                  <td className="p-4">
                    <span className="capitalize bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {batches.find(b => b.id === exp.batchId)?.name || exp.batchId || '-'}
                  </td>
                  <td className="p-4 font-bold text-right text-red-500">{formatCurrency(exp.amount)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenEdit(exp)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this expense?')) deleteExpense(exp.id); }} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Expense' : 'Add New Expense'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Description *</label>
            <input required type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="e.g. Broiler Pre-Starter Feed 50 Bags" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })} className={inputClass}>
                <option value="feed">Feed</option>
                <option value="medicine">Medicine</option>
                <option value="electricity">Electricity</option>
                <option value="labour">Labour</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Amount ({settings.currency}) *</label>
              <input required type="number" min="0" step="0.01" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className={inputClass} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date</label>
              <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Linked Batch (Optional)</label>
              <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className={inputClass}>
                <option value="">-- None --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm hover:bg-[var(--bg-secondary)] transition-all">
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              {editingId ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
