"use client";

import { useFarmStore } from '@/store/useFarmStore';
import { Plus, DollarSign } from 'lucide-react';

export default function RevenuePage() {
  const { revenues, settings, theme } = useFarmStore();
  
  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm ${theme === 'obsidian' ? 'obsidian-glass' : ''}`;
  
  const formatCurrency = (value: number) => {
    return `${settings.currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const totalRevenue = revenues.reduce((sum, r) => sum + r.grossRevenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Revenue</h1>
        <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-all duration-200">
          <Plus size={18} />
          <span>Add Revenue</span>
        </button>
      </div>

      {/* Summary */}
      <div className={`p-6 flex items-center justify-between ${cardClass}`}>
        <div>
          <p className="text-[var(--text-secondary)] font-medium mb-1">Total Gross Revenue</p>
          <h2 className="text-3xl font-bold text-emerald-500">{formatCurrency(totalRevenue)}</h2>
        </div>
        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-500 hidden sm:block">
          <DollarSign size={32} />
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${cardClass}`}>
        {revenues.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            No revenue recorded yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <th className="p-4 font-medium rounded-tl-2xl">Date</th>
                <th className="p-4 font-medium">Buyer Name</th>
                <th className="p-4 font-medium">Batch</th>
                <th className="p-4 font-medium text-right">Chickens Sold</th>
                <th className="p-4 font-medium text-right">Price/Chicken</th>
                <th className="p-4 font-medium rounded-tr-2xl text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenues.map((rev) => (
                <tr key={rev.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="p-4">{rev.date}</td>
                  <td className="p-4 font-medium">{rev.buyerName}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{rev.batchId}</td>
                  <td className="p-4 text-right">{rev.totalChickensSold}</td>
                  <td className="p-4 text-right">{formatCurrency(rev.sellingPricePerChicken)}</td>
                  <td className="p-4 font-bold text-right text-emerald-500">{formatCurrency(rev.grossRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
