'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Printer, X, Download, ShieldCheck, Bird, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import { SaleRecord, useFarmStore } from '@/store/useFarmStore';

interface SaleInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
}

export default function SaleInvoiceModal({ isOpen, onClose, sale }: SaleInvoiceModalProps) {
  const { settings, batches } = useFarmStore();

  if (!sale) return null;

  const linkedBatch = batches.find((b) => b.id === sale.batchId);
  const totalWeightKg = (sale.chickensSold * sale.averageWeight).toFixed(1);
  const invoiceNum = `INV-POULTRY-${sale.id.slice(-6).toUpperCase()}`;
  const saleDateFormatted = new Date(sale.saleDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧾 Commercial Bird Sale Invoice & Delivery Challan" size="lg">
      <div className="space-y-6">
        {/* Action Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] print:hidden">
          <span className="text-xs text-[var(--text-secondary)]">
            Invoice Number: <strong className="text-[var(--text-primary)]">{invoiceNum}</strong>
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice / Save as PDF</span>
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="printable-sale-invoice"
          className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0"
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Bird className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  {settings.farmName || 'Greenfield Bio-Secure Poultry Farm'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Commercial Broiler Farm • Government Bio-Secure Registered
              </p>
              <p className="text-xs text-slate-500">
                Location: {settings.location || 'Hyderabad, Telangana, India'}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                OFFICIAL SALE RECEIPT
              </span>
              <div className="text-xs text-slate-500 mt-2">
                Date: <strong className="text-slate-800">{saleDateFormatted}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Invoice No: <strong className="text-slate-800">{invoiceNum}</strong>
              </div>
            </div>
          </div>

          {/* Buyer & Batch Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Wholesale Buyer / Trader
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{sale.buyer}</div>
              <p className="text-slate-500 mt-0.5">Commercial Live Poultry Weighment</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Origin Batch & Flock
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {linkedBatch?.batchNumber || 'Batch General'} ({linkedBatch?.breedType || 'Broiler Cobb 500'})
              </div>
              <p className="text-slate-500 mt-0.5">Weighment Slip Verified</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Item Description</th>
                  <th className="p-3.5 text-center">Birds Sold</th>
                  <th className="p-3.5 text-center">Avg. Wt (kg)</th>
                  <th className="p-3.5 text-center">Total Net Wt (kg)</th>
                  <th className="p-3.5 text-center">Rate / kg (₹)</th>
                  <th className="p-3.5 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr>
                  <td className="p-3.5">
                    <span className="font-bold">Live Commercial Broiler Birds</span>
                    <span className="block text-[10px] text-slate-500">Farm-gate live bird dispatch</span>
                  </td>
                  <td className="p-3.5 text-center font-bold">{sale.chickensSold.toLocaleString()}</td>
                  <td className="p-3.5 text-center">{sale.averageWeight.toFixed(2)} kg</td>
                  <td className="p-3.5 text-center font-semibold">{totalWeightKg} kg</td>
                  <td className="p-3.5 text-center font-semibold">₹ {sale.pricePerKg}</td>
                  <td className="p-3.5 text-right font-black text-emerald-700 text-sm">
                    ₹ {sale.totalRevenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & Summary */}
          <div className="flex justify-between items-end pt-2">
            <div className="text-xs text-slate-500 space-y-1">
              <p>• Notes: {sale.notes || 'Full payment settled upon vehicle dispatch.'}</p>
              <p>• Authorized Signatory: <strong>{useFarmStore.getState().user?.name || 'Farm Owner'}</strong> ({useFarmStore.getState().user?.role || 'Farm Lead'})</p>
            </div>

            <div className="text-right p-4 rounded-2xl bg-emerald-50 border border-emerald-200 min-w-48">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Grand Total Amount
              </span>
              <div className="text-2xl font-black text-emerald-800 mt-0.5">
                ₹ {sale.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">Payment Status: Paid In Full</span>
            </div>
          </div>

          {/* Authorized Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Official Computer Generated Receipt • ChickFarm Pro OS</span>
            <div className="text-right">
              <span className="block text-slate-700 font-bold">Authorized Farm Seal & Signature</span>
              <span className="text-[10px]">Greenfield Bio-Secure Poultry Operations</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
