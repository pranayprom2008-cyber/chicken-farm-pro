"use client";

import { useState } from 'react';
import { useFarmStore, Revenue } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';

const emptyRevenue = {
  buyerName: '',
  totalChickensSold: 0,
  sellingPricePerChicken: 0,
  date: new Date().toISOString().split('T')[0],
  batchId: '',
  notes: '',
};

export default function RevenuePage() {
  const { revenues, settings, theme, addRevenue, updateRevenue, deleteRevenue, batches } = useFarmStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRevenue);

  const isObsidian = theme === 'obsidian';
  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm ${isObsidian ? 'obsidian-glass' : ''}`;
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 ${isObsidian ? 'focus:ring-violet-500/50' : 'focus:ring-emerald-500/50'} transition-all`;
  const btnPrimary = `flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${
    isObsidian ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
  }`;

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const totalRevenue = revenues.reduce((sum, r) => sum + r.grossRevenue, 0);
  const totalBirdsSold = revenues.reduce((sum, r) => sum + r.totalChickensSold, 0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyRevenue);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rev: Revenue) => {
    setEditingId(rev.id);
    setForm({
      buyerName: rev.buyerName,
      totalChickensSold: rev.totalChickensSold,
      sellingPricePerChicken: rev.sellingPricePerChicken,
      date: rev.date,
      batchId: rev.batchId || '',
      notes: rev.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyerName || form.totalChickensSold <= 0 || form.sellingPricePerChicken <= 0) return;

    if (editingId) {
      updateRevenue(editingId, form);
    } else {
      addRevenue(form);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Revenue & Sales</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">Track bird sales, buyer receipts, and income</p>
        </div>
        <button onClick={handleOpenAdd} className={btnPrimary}>
          <Plus size={18} />
          <span>Add Revenue</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-6 flex items-center justify-between ${cardClass}`}>
          <div>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Gross Revenue</p>
            <h2 className="text-3xl font-bold text-emerald-500">{formatCurrency(totalRevenue)}</h2>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 hidden sm:block">
            <DollarSign size={32} />
          </div>
        </div>
        <div className={`p-6 flex items-center justify-between ${cardClass}`}>
          <div>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Birds Sold</p>
            <h2 className="text-3xl font-bold text-blue-500">{totalBirdsSold.toLocaleString()} Birds</h2>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 hidden sm:block">
            <Plus size={32} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${cardClass}`}>
        {revenues.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No revenue recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs">
                <th className="p-4 font-medium rounded-tl-2xl">Date</th>
                <th className="p-4 font-medium">Buyer Name</th>
                <th className="p-4 font-medium">Batch</th>
                <th className="p-4 font-medium text-right">Chickens Sold</th>
                <th className="p-4 font-medium text-right">Price/Bird</th>
                <th className="p-4 font-medium text-right">Gross Revenue</th>
                <th className="p-4 font-medium rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {revenues.map((rev) => (
                <tr key={rev.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4 text-[var(--text-secondary)]">{rev.date}</td>
                  <td className="p-4 font-medium text-[var(--text-primary)]">{rev.buyerName}</td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {batches.find(b => b.id === rev.batchId)?.name || rev.batchId || '-'}
                  </td>
                  <td className="p-4 text-right font-medium text-[var(--text-primary)]">{rev.totalChickensSold.toLocaleString()}</td>
                  <td className="p-4 text-right text-[var(--text-secondary)]">{formatCurrency(rev.sellingPricePerChicken)}</td>
                  <td className="p-4 font-bold text-right text-emerald-500">{formatCurrency(rev.grossRevenue)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenEdit(rev)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this revenue record?')) deleteRevenue(rev.id); }} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
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

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Revenue' : 'Add New Revenue'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Buyer / Customer Name *</label>
            <input required type="text" value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className={inputClass} placeholder="e.g. Metro Fresh Chicken" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Chickens Sold *</label>
              <input required type="number" min="1" value={form.totalChickensSold || ''} onChange={e => setForm({ ...form, totalChickensSold: Number(e.target.value) })} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Price per Chicken ({settings.currency}) *</label>
              <input required type="number" min="0" step="0.01" value={form.sellingPricePerChicken || ''} onChange={e => setForm({ ...form, sellingPricePerChicken: Number(e.target.value) })} className={inputClass} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date</label>
              <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Batch (Optional)</label>
              <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className={inputClass}>
                <option value="">-- None --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)]">Calculated Total:</span>
            <span className="font-bold text-emerald-500 text-base">
              {formatCurrency((form.totalChickensSold || 0) * (form.sellingPricePerChicken || 0))}
            </span>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm hover:bg-[var(--bg-secondary)] transition-all">
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              {editingId ? 'Update Revenue' : 'Save Revenue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
