'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import TiltCard from '@/components/TiltCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import SaleInvoiceModal from '@/components/SaleInvoiceModal';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Scale,
  Bird,
  Percent,
  Download,
  Sparkles,
  CheckCircle2,
  Printer,
  FileText
} from 'lucide-react';

const emptySaleForm = {
  buyer: '',
  chickensSold: '',
  averageWeight: '2.2',
  pricePerKg: '110',
  batchId: '',
  saleDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function RevenuePage() {
  const {
    batches,
    sales,
    fetchSales,
    createSaleRecord,
    deleteSaleRecord,
    settings,
    theme
  } = useFarmStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [form, setForm] = useState(emptySaleForm);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';
  const currency = settings?.currency || '₹';

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const birdsSold = parseFloat(form.chickensSold) || 0;
  const avgW = parseFloat(form.averageWeight) || 0;
  const rateKg = parseFloat(form.pricePerKg) || 0;
  const liveGrossRevenue = birdsSold * avgW * rateKg;

  const totalGrossRevenue = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
  const totalBirdsSold = sales.reduce((sum, s) => sum + (s.chickensSold || 0), 0);
  const avgSellingRate = totalBirdsSold > 0 ? totalGrossRevenue / totalBirdsSold : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birdsSold || rateKg <= 0) return;
    setSaving(true);

    const res = await createSaleRecord({
      batchId: form.batchId || undefined,
      chickensSold: birdsSold,
      averageWeight: avgW,
      pricePerKg: rateKg,
      totalRevenue: liveGrossRevenue,
      buyer: form.buyer || 'Wholesale Buyer',
      notes: form.notes,
      saleDate: form.saleDate,
    });

    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setForm(emptySaleForm);
      setSuccessMessage('Bird sale recorded and persisted successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDelete = async (id: string, buyer?: string | null) => {
    if (confirm(`Delete sale record for ${buyer || 'this sale'}? Revenue and stats will be updated.`)) {
      await deleteSaleRecord(id);
    }
  };

  const exportCSV = () => {
    if (sales.length === 0) return;
    const headers = ['Buyer', 'Birds Sold', 'Avg Weight (kg)', 'Rate (₹/kg)', 'Gross Revenue (₹)', 'Date', 'Batch'];
    const rows = sales.map((s) => [
      `"${s.buyer || ''}"`,
      s.chickensSold,
      s.averageWeight,
      s.pricePerKg,
      s.totalRevenue,
      new Date(s.saleDate).toLocaleDateString('en-IN'),
      s.batch?.batchNumber || 'General',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `chickfarm_sales_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Success Alert Toast */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Revenue & Bird Sales
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Log wholesale bird lifts, calculate average bird weight, and track profit realizations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sales.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}

          <button
            onClick={() => {
              setForm(emptySaleForm);
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              isLiquid
                ? 'bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-500 hover:opacity-90 shadow-violet-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Record Bird Sale</span>
          </button>
        </div>
      </div>

      {/* 3D Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TiltCard maxTilt={8} glare={true}>
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] h-full flex flex-col justify-between ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Total Realized Revenue
              </span>
              <div className="text-3xl font-extrabold text-emerald-400">
                {currency} <AnimatedCounter value={totalGrossRevenue} />
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
              From all recorded wholesale flock lifts
            </p>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} glare={true}>
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] h-full flex flex-col justify-between ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Total Birds Sold
              </span>
              <div className="text-3xl font-extrabold text-[var(--text-primary)]">
                <AnimatedCounter value={totalBirdsSold} /> Birds
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
              Live market harvest batch sales
            </p>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} glare={true}>
          <div
            className={`p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] h-full flex flex-col justify-between ${
              isLiquid ? 'liquid-panel' : 'shadow-sm'
            }`}
          >
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Average Realization / Bird
              </span>
              <div className="text-3xl font-extrabold text-cyan-400">
                {currency} {avgSellingRate.toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
              Weighted realization per chicken sold
            </p>
          </div>
        </TiltCard>
      </div>

      {/* Sales Table / List */}
      {sales.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
            isLiquid ? 'liquid-panel' : ''
          }`}
        >
          <TrendingUp className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-40 mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No sales recorded yet</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Log bird harvest sales to compute gross revenue and profit per chicken.
          </p>
          <button
            onClick={() => {
              setForm(emptySaleForm);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record First Sale</span>
          </button>
        </div>
      ) : (
        <div
          className={`rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-lg ${
            isLiquid ? 'liquid-panel' : 'shadow-sm'
          }`}
        >
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Recorded Sales Transactions ({sales.length})
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">
              Universal Auto-Persistent
            </span>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {sales.map((sale) => {
              const formattedDate = new Date(sale.saleDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              // Find batch name if available
              const associatedBatch = batches.find((b) => b.id === sale.batchId);

              return (
                <div
                  key={sale.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isLiquid ? 'hover:bg-white/[0.02]' : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isLiquid ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {sale.buyer || 'Wholesale Buyer'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {sale.chickensSold.toLocaleString()} Birds
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span>Avg Wt: <strong>{sale.averageWeight} kg</strong></span>
                        <span>Rate: <strong>₹{sale.pricePerKg}/kg</strong></span>
                        {(associatedBatch || sale.batch) && (
                          <span className="flex items-center gap-1 text-cyan-400 font-medium">
                            <Layers className="w-3 h-3" />
                            {associatedBatch?.batchNumber || sale.batch?.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-emerald-400 whitespace-nowrap">
                      + {currency} {sale.totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSaleForInvoice(sale);
                        setIsInvoiceOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Generate Printable Wholesale Invoice / Challan"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print Receipt</span>
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id, sale.buyer)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete sale"
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

      {/* Record Bird Sale Modal with Live Calculation */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Live Bird Sale"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Buyer / Trader Name *
              </label>
              <input
                type="text"
                required
                value={form.buyer}
                onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                placeholder="e.g. Royal Chicken Center / Wholesale Trader"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Chickens Sold *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.chickensSold}
                  onChange={(e) => setForm({ ...form, chickensSold: e.target.value })}
                  placeholder="e.g. 4800"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Avg Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={form.averageWeight}
                  onChange={(e) => setForm({ ...form, averageWeight: e.target.value })}
                  placeholder="e.g. 2.2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Price / kg (₹) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={form.pricePerKg}
                  onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                  placeholder="e.g. 110"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Harvest Date
                </label>
                <input
                  type="date"
                  value={form.saleDate}
                  onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Batch Association
                </label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                >
                  <option value="">-- General Sale --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} - {b.batchName || b.breedType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Computed Gross Revenue Box */}
            <div
              className={`p-4 rounded-2xl text-center border ${
                isLiquid ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Calculated Gross Revenue
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 my-0.5">
                ₹ {liveGrossRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Total Weight: {(birdsSold * avgW).toLocaleString()} kg @ ₹{rateKg}/kg
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || liveGrossRevenue <= 0}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer"
              >
                {saving ? 'Saving...' : 'Record Sale'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Invoice / Delivery Challan Modal */}
      <SaleInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSaleForInvoice}
      />
    </div>
  );
}
