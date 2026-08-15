"use client";

import { useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { Plus, Wallet } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, settings, theme } = useFarmStore();
  const [filter, setFilter] = useState('All');
  
  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm ${theme === 'obsidian' ? 'obsidian-glass' : ''}`;
  
  const formatCurrency = (value: number) => {
    return `${settings.currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const categories = ['All', 'Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Other'];
  
  const filteredExpenses = filter === 'All' ? expenses : expenses.filter(e => e.category.toLowerCase() === filter.toLowerCase());
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-all duration-200">
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary */}
      <div className={`p-6 flex items-center justify-between ${cardClass}`}>
        <div>
          <p className="text-[var(--text-secondary)] font-medium mb-1">Total Expenses ({filter})</p>
          <h2 className="text-3xl font-bold text-red-500">{formatCurrency(totalExpense)}</h2>
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-500 hidden sm:block">
          <Wallet size={32} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${filter === cat 
                ? 'bg-primary-500 text-white shadow-sm' 
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
            No expenses found for this category.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <th className="p-4 font-medium rounded-tl-2xl">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Batch</th>
                <th className="p-4 font-medium rounded-tr-2xl text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="p-4">{exp.date}</td>
                  <td className="p-4">{exp.description}</td>
                  <td className="p-4">
                    <span className="capitalize bg-[var(--bg-secondary)] px-2 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{exp.batchId || '-'}</td>
                  <td className="p-4 font-medium text-right text-red-500">{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
