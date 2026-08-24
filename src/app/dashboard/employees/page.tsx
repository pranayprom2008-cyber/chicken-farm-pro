'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import {
  Users,
  UserPlus,
  Phone,
  Calendar,
  DollarSign,
  Trash2,
  Layers,
  Clock,
  Download
} from 'lucide-react';
import Modal from '@/components/Modal';
import TiltCard from '@/components/TiltCard';

export default function EmployeesPage() {
  const { theme, batches, createLabourRecord } = useFarmStore();

  const [labourLogs, setLabourLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [employeeName, setEmployeeName] = useState('');
  const [daysWorked, setDaysWorked] = useState('1');
  const [dailyWage, setDailyWage] = useState('600');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [saving, setSaving] = useState(false);

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass';

  const fetchLabour = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/labour');
      if (res.ok) {
        const data = await res.json();
        setLabourLogs(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabour();
  }, []);

  const totalLabourCost = labourLogs.reduce((sum, l) => sum + (l.totalCost || 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !dailyWage) return;
    setSaving(true);
    const res = await createLabourRecord({
      batchId: selectedBatchId || undefined,
      employeeName,
      daysWorked: Number(daysWorked) || 1,
      dailyWage: Number(dailyWage),
    });
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setEmployeeName('');
      setDaysWorked('1');
      setDailyWage('600');
      await fetchLabour();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this labour record?')) {
      await fetch(`/api/labour/${id}`, { method: 'DELETE' });
      await fetchLabour();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Employee & Labour Management
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Record staff wages, attendance, and farm operations personnel
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-md ${
            isLiquid
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-violet-500/20'
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Record Wage / Work</span>
        </button>
      </div>

      {/* Active Farm Manager / Operator */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Active Farm Leadership & Workforce
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TiltCard maxTilt={8} glare={true}>
            <div
              className={`p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
                isLiquid ? 'liquid-panel' : 'shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                    {useFarmStore.getState().user?.name ? useFarmStore.getState().user!.name[0].toUpperCase() : 'F'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                        {useFarmStore.getState().user?.name || 'Farm Owner'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {useFarmStore.getState().user?.role || 'Farm Lead'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Primary Farm Administrator</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">Cloud Identity:</span>
                <span className="font-bold text-[var(--text-primary)] tracking-wide">
                  {useFarmStore.getState().user?.email || 'Authenticated Cloud Account'}
                </span>
              </div>
            </div>
          </TiltCard>

          <TiltCard maxTilt={8} glare={true}>
            <div
              className={`p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
                isLiquid ? 'liquid-panel' : 'shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[var(--text-primary)]">Farm Workforce</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Active Staff
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Attendants, Shed Labour & Feed Handlers</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">Logged Staff Members:</span>
                <span className="font-bold text-[var(--text-primary)] tracking-wide">
                  {new Set(labourLogs.map((l) => l.employeeName)).size} Farm Workers
                </span>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
            isLiquid ? 'liquid-panel' : 'shadow-sm'
          }`}
        >
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
            Total Cumulative Labour Payouts
          </span>
          <div className="text-3xl font-extrabold text-[var(--text-primary)]">
            ₹ {totalLabourCost.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Recorded in database</p>
        </div>

        <div
          className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
            isLiquid ? 'liquid-panel' : 'shadow-sm'
          }`}
        >
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
            Active Records
          </span>
          <div className="text-3xl font-extrabold text-cyan-400">
            {labourLogs.length} Entries
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Attendance and wages logged</p>
        </div>
      </div>

      {/* Labour List */}
      {labourLogs.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
            isLiquid ? 'liquid-panel' : ''
          }`}
        >
          <Users className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-40 mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No labour records found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Log farm worker wages and attendance days.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${
            isLiquid ? 'liquid-panel' : 'shadow-sm'
          }`}
        >
          <div className="divide-y divide-[var(--border-color)]">
            {labourLogs.map((l) => {
              const formattedDate = new Date(l.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={l.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isLiquid ? 'hover:bg-white/[0.02]' : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isLiquid ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {l.employeeName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--bg-input)] text-[var(--text-secondary)]">
                          {l.daysWorked} Days @ ₹{l.dailyWage}/day
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        {l.batch && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Layers className="w-3 h-3" />
                            {l.batch.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[var(--text-primary)] whitespace-nowrap">
                      ₹ {l.totalCost.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete record"
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

      {/* Record Wage Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Employee Wage / Attendance"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Employee / Worker Name *
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Ramesh Kumar / Suresh (Attendant)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Days Worked
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={daysWorked}
                  onChange={(e) => setDaysWorked(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Daily Wage (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Batch (Optional)
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              >
                <option value="">-- General Farm Staff --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} - {b.batchName || b.breedType}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`p-3.5 rounded-xl text-center border ${
                isLiquid ? 'bg-cyan-950/30 border-cyan-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Total Payout</span>
              <p className="text-xl font-bold text-emerald-400">
                ₹ {((Number(daysWorked) || 0) * (Number(dailyWage) || 0)).toLocaleString('en-IN')}
              </p>
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
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
