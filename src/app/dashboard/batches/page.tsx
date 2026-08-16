"use client";

import { useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import { Plus, Edit2, Trash2, Skull, Bird } from 'lucide-react';

const emptyForm = {
  name: '', breedType: 'Broiler', totalChicks: 0, chicksDead: 0,
  status: 'growing' as 'growing' | 'sold' | 'completed',
  startDate: new Date().toISOString().split('T')[0],
  expectedEndDate: '', notes: '',
};

export default function BatchesPage() {
  const { batches, theme, addBatch, updateBatch, deleteBatch, recordMortality } = useFarmStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMortalityModal, setShowMortalityModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [mortalityCount, setMortalityCount] = useState(0);
  const isObsidian = theme === 'obsidian';

  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm ${isObsidian ? 'obsidian-glass' : ''}`;
  const inputClass = `w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 ${isObsidian ? 'focus:ring-violet-500/50' : 'focus:ring-emerald-500/50'} transition-all`;
  const btnPrimary = `px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${isObsidian ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500' : 'bg-emerald-500 hover:bg-emerald-600'}`;

  const handleAdd = () => {
    if (!form.name || form.totalChicks <= 0) return;
    addBatch(form);
    setForm(emptyForm);
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (!selectedBatch || !form.name) return;
    updateBatch(selectedBatch, form);
    setShowEditModal(false);
    setSelectedBatch(null);
  };

  const openEdit = (batch: typeof batches[0]) => {
    setSelectedBatch(batch.id);
    setForm({
      name: batch.name, breedType: batch.breedType, totalChicks: batch.totalChicks,
      chicksDead: batch.chicksDead, status: batch.status, startDate: batch.startDate,
      expectedEndDate: batch.expectedEndDate, notes: batch.notes,
    });
    setShowEditModal(true);
  };

  const handleMortality = () => {
    if (!selectedBatch || mortalityCount <= 0) return;
    recordMortality(selectedBatch, mortalityCount);
    setMortalityCount(0);
    setShowMortalityModal(false);
    setSelectedBatch(null);
  };

  const BatchForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Batch Name *</label>
        <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Batch #1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Breed Type</label>
          <select className={inputClass} value={form.breedType} onChange={(e) => setForm({ ...form, breedType: e.target.value })}>
            <option>Broiler</option><option>Layer</option><option>Desi</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'growing' | 'sold' | 'completed' })}>
            <option value="growing">Growing</option><option value="sold">Sold</option><option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Total Chicks *</label>
          <input className={inputClass} type="number" min={0} value={form.totalChicks || ''} onChange={(e) => setForm({ ...form, totalChicks: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Initial Dead</label>
          <input className={inputClass} type="number" min={0} value={form.chicksDead || ''} onChange={(e) => setForm({ ...form, chicksDead: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
          <input className={inputClass} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Expected End</label>
          <input className={inputClass} type="date" value={form.expectedEndDate} onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
        <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
        <button onClick={onSubmit} className={btnPrimary}>{submitLabel}</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Batch Management</h1>
        <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className={`flex items-center gap-2 ${btnPrimary}`}>
          <Plus size={18} />
          <span>Add New Batch</span>
        </button>
      </div>

      {batches.length === 0 ? (
        <div className={`p-12 text-center flex flex-col items-center justify-center ${cardClass}`}>
          <div className={`p-4 rounded-full mb-4 ${isObsidian ? 'bg-violet-500/10' : 'bg-emerald-500/10'}`}>
            <Bird size={32} className={isObsidian ? 'text-violet-400' : 'text-emerald-500'} />
          </div>
          <h2 className="text-xl font-medium mb-2">No batches yet</h2>
          <p className="text-[var(--text-secondary)] mb-6">Create your first batch to start tracking your farm.</p>
          <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className={btnPrimary}>Add First Batch</button>
        </div>
      ) : (
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <th className="p-4 font-medium rounded-tl-2xl">Name</th>
                <th className="p-4 font-medium">Breed</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Alive</th>
                <th className="p-4 font-medium">Dead</th>
                <th className="p-4 font-medium">Mortality %</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4 font-medium">{batch.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{batch.breedType}</td>
                  <td className="p-4">{batch.totalChicks}</td>
                  <td className="p-4 text-emerald-500 font-medium">{batch.chicksAlive}</td>
                  <td className="p-4 text-red-500">{batch.chicksDead}</td>
                  <td className="p-4">{batch.mortalityPercentage.toFixed(1)}%</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium
                      ${batch.status === 'growing' ? 'bg-emerald-500/10 text-emerald-600' : ''}
                      ${batch.status === 'sold' ? 'bg-blue-500/10 text-blue-600' : ''}
                      ${batch.status === 'completed' ? 'bg-gray-500/10 text-gray-500' : ''}
                    `}>
                      {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setSelectedBatch(batch.id); setMortalityCount(0); setShowMortalityModal(true); }}
                        className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-colors" title="Record Mortality">
                        <Skull size={16} />
                      </button>
                      <button onClick={() => openEdit(batch)} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if (confirm('Delete this batch?')) deleteBatch(batch.id); }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Batch Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Batch">
        <BatchForm onSubmit={handleAdd} submitLabel="Create Batch" />
      </Modal>

      {/* Edit Batch Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Batch">
        <BatchForm onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>

      {/* Record Mortality Modal */}
      <Modal isOpen={showMortalityModal} onClose={() => setShowMortalityModal(false)} title="Record Mortality">
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)] text-sm">Enter the number of deaths to record for this batch.</p>
          <input className={inputClass} type="number" min={1} value={mortalityCount || ''} onChange={(e) => setMortalityCount(Number(e.target.value))} placeholder="Number of deaths" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowMortalityModal(false)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
            <button onClick={handleMortality} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">Record Deaths</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
