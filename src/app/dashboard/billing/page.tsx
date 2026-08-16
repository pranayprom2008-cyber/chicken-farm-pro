"use client";
import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { Receipt, CreditCard, AlertCircle, CheckCircle, Plus, Trash2, Edit, X, Calculator, ArrowRight, DollarSign } from 'lucide-react';

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
  const { currentPhone, theme, settings } = useFarmStore();
  const [activeTab, setActiveTab] = useState<'invoices' | 'calculator'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // Calculator State
  const [birdCount, setBirdCount] = useState(1000);
  const [chickPrice, setChickPrice] = useState(35);
  const [feedKgPerBird, setFeedKgPerBird] = useState(3.2);
  const [feedCostPerKg, setFeedCostPerKg] = useState(42);
  const [medicinePerBird, setMedicinePerBird] = useState(8);
  const [otherCostPerBird, setOtherCostPerBird] = useState(5);
  const [mortalityRate, setMortalityRate] = useState(3.5);
  const [avgWeightKg, setAvgWeightKg] = useState(2.1);
  const [sellingPricePerKg, setSellingPricePerKg] = useState(120);

  const isObsidian = theme === 'obsidian';
  const storageKey = `chickfarm-${currentPhone || 'default'}-billing`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newInvoices));
    }
  };

  const handleSaveInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInvoice: Invoice = {
      id: editingInvoice ? editingInvoice.id : `INV-${Date.now().toString().slice(-6)}`,
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

  // Calculations
  const birdsAlive = Math.round(birdCount * (1 - mortalityRate / 100));
  const totalWeightKg = birdsAlive * avgWeightKg;
  const totalChickCost = birdCount * chickPrice;
  const totalFeedCost = birdCount * feedKgPerBird * feedCostPerKg;
  const totalMedCost = birdCount * medicinePerBird;
  const totalOtherCost = birdCount * otherCostPerBird;
  const totalProductionCost = totalChickCost + totalFeedCost + totalMedCost + totalOtherCost;
  const grossRevenueCalc = totalWeightKg * sellingPricePerKg;
  const netProfitCalc = grossRevenueCalc - totalProductionCost;
  const costPerKg = totalWeightKg > 0 ? totalProductionCost / totalWeightKg : 0;
  const profitPerBird = birdsAlive > 0 ? netProfitCalc / birdsAlive : 0;

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingBalance = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const cardClass = `rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${isObsidian ? 'obsidian-glass' : 'shadow-sm'}`;
  const inputClass = `w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${isObsidian ? 'focus:ring-violet-500/50' : 'focus:ring-emerald-500/50'} transition-all`;
  const btnPrimary = `px-4 py-2.5 text-white flex items-center gap-2 transition-all duration-200 rounded-xl text-sm font-medium ${
    isObsidian ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Receipt className="w-6 h-6" /> Billing & Invoices
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">Manage customer billing, invoices and profitability calculations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'invoices' ? (isObsidian ? 'bg-violet-600 text-white' : 'bg-emerald-500 text-white shadow-sm') : 'text-[var(--text-secondary)]'}`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${activeTab === 'calculator' ? (isObsidian ? 'bg-violet-600 text-white' : 'bg-emerald-500 text-white shadow-sm') : 'text-[var(--text-secondary)]'}`}
            >
              <Calculator className="w-3.5 h-3.5" /> Calculator
            </button>
          </div>
          {activeTab === 'invoices' && (
            <button
              onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }}
              className={btnPrimary}
            >
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          )}
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 ${cardClass}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Receipt className="w-5 h-5" /></div>
                <h3 className="text-sm text-[var(--text-secondary)] font-medium">Total Billed</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{settings.currency}{totalBilled.toLocaleString()}</p>
            </div>
            <div className={`p-5 ${cardClass}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-5 h-5" /></div>
                <h3 className="text-sm text-[var(--text-secondary)] font-medium">Total Paid</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-500">{settings.currency}{totalPaid.toLocaleString()}</p>
            </div>
            <div className={`p-5 ${cardClass}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><CreditCard className="w-5 h-5" /></div>
                <h3 className="text-sm text-[var(--text-secondary)] font-medium">Outstanding</h3>
              </div>
              <p className="text-2xl font-bold text-amber-500">{settings.currency}{outstandingBalance.toLocaleString()}</p>
            </div>
            <div className={`p-5 ${cardClass}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><AlertCircle className="w-5 h-5" /></div>
                <h3 className="text-sm text-[var(--text-secondary)] font-medium">Overdue</h3>
              </div>
              <p className="text-2xl font-bold text-red-500">{settings.currency}{overdueAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Invoices Table */}
          <div className={`${cardClass} overflow-hidden`}>
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center flex-wrap gap-3">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Payment History</h2>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium">
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-sm">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-[var(--text-muted)]">
                        <div className="flex flex-col items-center justify-center">
                          <Receipt className="w-10 h-10 mb-2 opacity-30" />
                          <p>No invoices recorded yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="p-4 font-mono font-medium text-[var(--text-primary)]">{inv.id}</td>
                        <td className="p-4 text-[var(--text-secondary)]">
                          <div className="font-medium text-[var(--text-primary)]">{inv.customerName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{inv.description}</div>
                        </td>
                        <td className="p-4 font-semibold text-[var(--text-primary)]">{settings.currency}{inv.amount.toLocaleString()}</td>
                        <td className="p-4 text-[var(--text-secondary)]">{inv.date}</td>
                        <td className="p-4 text-[var(--text-secondary)]">{inv.dueDate}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' :
                            inv.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-red-500/10 text-red-600'
                          }`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
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
        </>
      ) : (
        /* Calculator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className={`lg:col-span-2 p-6 ${cardClass} space-y-4`}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" /> Batch Cost & Profit Calculator
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Estimate production costs, feed requirements, and projected profits before harvesting.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Total Birds in Batch</label>
                <input type="number" min={1} value={birdCount} onChange={e => setBirdCount(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Chick Cost per Bird ({settings.currency})</label>
                <input type="number" min={0} value={chickPrice} onChange={e => setChickPrice(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Feed Consumption per Bird (kg)</label>
                <input type="number" step="0.1" min={0} value={feedKgPerBird} onChange={e => setFeedKgPerBird(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Feed Cost per kg ({settings.currency})</label>
                <input type="number" min={0} value={feedCostPerKg} onChange={e => setFeedCostPerKg(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Medicine & Vaccine per Bird ({settings.currency})</label>
                <input type="number" min={0} value={medicinePerBird} onChange={e => setMedicinePerBird(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Labour & Overhead per Bird ({settings.currency})</label>
                <input type="number" min={0} value={otherCostPerBird} onChange={e => setOtherCostPerBird(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Expected Mortality Rate (%)</label>
                <input type="number" step="0.1" min={0} max={100} value={mortalityRate} onChange={e => setMortalityRate(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Avg Body Weight at Sale (kg)</label>
                <input type="number" step="0.1" min={0.5} value={avgWeightKg} onChange={e => setAvgWeightKg(Number(e.target.value))} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Selling Price per kg ({settings.currency})</label>
                <input type="number" min={0} value={sellingPricePerKg} onChange={e => setSellingPricePerKg(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className={`p-6 ${cardClass} space-y-4 flex flex-col justify-between`}>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Calculation Results</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Birds Harvested:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{birdsAlive.toLocaleString()} birds</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Total Live Weight:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{totalWeightKg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Total Feed Needed:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{(birdCount * feedKgPerBird).toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Total Production Cost:</span>
                  <span className="font-semibold text-red-500">{settings.currency}{totalProductionCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Cost per kg:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{settings.currency}{costPerKg.toFixed(2)}/kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Gross Expected Revenue:</span>
                  <span className="font-semibold text-blue-500">{settings.currency}{grossRevenueCalc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 bg-[var(--bg-primary)] px-3 rounded-xl">
                  <span className="font-bold text-[var(--text-primary)]">Net Estimated Profit:</span>
                  <span className={`font-bold text-lg ${netProfitCalc >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {settings.currency}{netProfitCalc.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] px-1">
                  <span>Profit per Bird: {settings.currency}{profitPerBird.toFixed(2)}</span>
                  <span>FCR: {(feedKgPerBird / avgWeightKg).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const newInv: Invoice = {
                  id: `INV-${Date.now().toString().slice(-6)}`,
                  customerName: "Projected Batch Sale",
                  description: `${birdsAlive} Birds @ ${avgWeightKg}kg (${totalWeightKg.toFixed(1)}kg total)`,
                  amount: grossRevenueCalc,
                  date: new Date().toISOString().split('T')[0],
                  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  status: 'pending',
                };
                saveInvoices([...invoices, newInv]);
                setActiveTab('invoices');
              }}
              className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 ${
                isObsidian ? 'bg-gradient-to-r from-violet-600 to-cyan-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              Convert to New Invoice <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl ${isObsidian ? 'obsidian-glass' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveInvoice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Customer / Buyer Name *</label>
                <input required type="text" name="customerName" defaultValue={editingInvoice?.customerName} className={inputClass} placeholder="e.g. Hyderabad Poultry Center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Description *</label>
                <input required type="text" name="description" defaultValue={editingInvoice?.description} className={inputClass} placeholder="e.g. 500 Live Birds (Broiler)" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Total Amount ({settings.currency}) *</label>
                <input required type="number" min="0" step="0.01" name="amount" defaultValue={editingInvoice?.amount} className={inputClass} placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Invoice Date</label>
                  <input required type="date" name="date" defaultValue={editingInvoice?.date || new Date().toISOString().split('T')[0]} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Due Date</label>
                  <input required type="date" name="dueDate" defaultValue={editingInvoice?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Payment Status</label>
                <select name="status" defaultValue={editingInvoice?.status || 'pending'} className={inputClass}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--border-color)] transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" className={`flex-1 py-2.5 text-white rounded-xl text-sm font-medium ${
                  isObsidian ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
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
