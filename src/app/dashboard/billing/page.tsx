"use client";
import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { Receipt, CreditCard, AlertCircle, CheckCircle, Plus, Trash2, Edit, X } from 'lucide-react';

interface Invoice {
  id: string;
  customerName: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function BillingPage() {
  const { currentPhone, theme } = useFarmStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const storageKey = `chickfarm-${currentPhone}-billing`;

  useEffect(() => {
    if (currentPhone) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setInvoices(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse billing data");
        }
      }
    }
  }, [currentPhone, storageKey]);

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem(storageKey, JSON.stringify(newInvoices));
  };

  const handleSaveInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInvoice: Invoice = {
      id: editingInvoice ? editingInvoice.id : `INV-${Date.now()}`,
      customerName: formData.get('customerName') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as 'paid' | 'pending' | 'overdue',
    };

    if (editingInvoice) {
      saveInvoices(invoices.map(inv => inv.id === editingInvoice.id ? newInvoice : inv));
    } else {
      saveInvoices([...invoices, newInvoice]);
    }
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      saveInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingBalance = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Receipt className="w-6 h-6" /> Billing & Invoices
          </h1>
          <p className="text-[var(--text-secondary)]">Manage your payments and financial records</p>
        </div>
        <button
          onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }}
          className={`px-4 py-2 text-white flex items-center gap-2 transition-all duration-200 rounded-xl ${
            theme === 'obsidian' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          <Plus className="w-5 h-5" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Receipt className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Total Billed</h3>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">₹{totalBilled.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Total Paid</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-500">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><CreditCard className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Outstanding</h3>
          </div>
          <p className="text-2xl font-bold text-amber-500">₹{outstandingBalance.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><AlertCircle className="w-5 h-5" /></div>
            <h3 className="text-[var(--text-secondary)] font-medium">Overdue</h3>
          </div>
          <p className="text-2xl font-bold text-red-500">₹{overdueAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Payment History</h2>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                <th className="p-4 font-medium">Invoice #</th>
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="w-12 h-12 mb-3 opacity-20" />
                      <p>No invoices found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">{inv.id}</td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      <div>{inv.customerName}</div>
                      <div className="text-xs text-[var(--text-muted)]">{inv.description}</div>
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-primary)]">₹{inv.amount.toLocaleString()}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{inv.date}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{inv.dueDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                        inv.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingInvoice(inv); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Customer Name</label>
                <input required type="text" name="customerName" defaultValue={editingInvoice?.customerName} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <input required type="text" name="description" defaultValue={editingInvoice?.description} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. 100 Broilers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                <input required type="number" min="0" step="0.01" name="amount" defaultValue={editingInvoice?.amount} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date</label>
                  <input required type="date" name="date" defaultValue={editingInvoice?.date || new Date().toISOString().split('T')[0]} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Due Date</label>
                  <input required type="date" name="dueDate" defaultValue={editingInvoice?.dueDate} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
                <select name="status" defaultValue={editingInvoice?.status || 'pending'} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--border-color)] transition-all">
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all duration-200 ${
                  theme === 'obsidian' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}>
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
