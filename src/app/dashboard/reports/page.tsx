'use client';

import React, { useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { theme, batches, expenses, stats, settings } = useFarmStore();

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'batch'>('monthly');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass';
  const currency = settings.currency || '₹';

  const exportPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      // Title & Farm Header
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74);
      doc.text(settings.farmName || 'GreenField Poultry Farm', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Official Audit Report • Type: ${reportType.toUpperCase()} • Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.line(14, 32, 196, 32);

      // Summary Statistics Table
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('1. Farm Operations Summary', 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [['Metric', 'Value']],
        body: [
          ['Total Batches Placed', `${stats?.totalBatches || 0} Batches`],
          ['Current Live Chicks', `${(stats?.aliveChicks || 0).toLocaleString()} Birds`],
          ['Cumulative Dead Chicks', `${(stats?.deadChicks || 0).toLocaleString()} Birds`],
          ['Farm Mortality Rate', `${(stats?.mortalityPercentage || 0).toFixed(2)}%`],
          ['Total Feed Consumed', `${(stats?.feedConsumed || 0).toLocaleString()} kg`],
          ['Total Operating Expenditure', `INR ${(stats?.totalExpenditure || 0).toLocaleString()}`],
          ['Expected Harvest Revenue', `INR ${(stats?.expectedRevenue || 0).toLocaleString()}`],
          ['Estimated Net Profit', `INR ${(stats?.estimatedProfit || 0).toLocaleString()}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
      });

      // Batches Table
      const finalY1 = (doc as any).lastAutoTable.finalY + 10;
      doc.text('2. Flock Batch Breakdown', 14, finalY1);

      autoTable(doc, {
        startY: finalY1 + 4,
        head: [['Batch #', 'Breed', 'Total Chicks', 'Alive', 'Dead', 'Mortality %', 'Status']],
        body: batches.map((b) => [
          b.batchNumber,
          b.breedType,
          b.totalChicks.toLocaleString(),
          b.aliveChicks.toLocaleString(),
          b.deadChicks.toLocaleString(),
          `${b.mortalityPercentage}%`,
          b.status.toUpperCase(),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
      });

      // Recent Expenses
      const finalY2 = (doc as any).lastAutoTable.finalY + 10;
      doc.text('3. Expense Ledger (Recent)', 14, finalY2);

      autoTable(doc, {
        startY: finalY2 + 4,
        head: [['Category', 'Description', 'Amount (INR)', 'Date', 'Batch']],
        body: expenses.slice(0, 10).map((e) => [
          e.category,
          e.description,
          e.amount.toLocaleString(),
          new Date(e.date).toLocaleDateString(),
          e.batch?.batchNumber || 'General',
        ]),
        theme: 'striped',
      });

      doc.save(`ChickFarm_${reportType}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      setStatusMsg('PDF report generated & downloaded successfully!');
      setTimeout(() => setStatusMsg(''), 4000);
    } finally {
      setDownloading(false);
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Farm Name', settings.farmName],
      ['Total Batches', stats?.totalBatches || 0],
      ['Alive Chicks', stats?.aliveChicks || 0],
      ['Dead Chicks', stats?.deadChicks || 0],
      ['Mortality Rate', `${stats?.mortalityPercentage || 0}%`],
      ['Total Expenditure', stats?.totalExpenditure || 0],
      ['Expected Revenue', stats?.expectedRevenue || 0],
      ['Estimated Profit', stats?.estimatedProfit || 0],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Batches Sheet
    const batchData = [
      ['Batch Number', 'Batch Name', 'Breed', 'Total Chicks', 'Alive', 'Dead', 'Mortality %', 'Expenditure (₹)', 'Status'],
      ...batches.map((b) => [
        b.batchNumber,
        b.batchName,
        b.breedType,
        b.totalChicks,
        b.aliveChicks,
        b.deadChicks,
        b.mortalityPercentage,
        b.totalExpenditure,
        b.status,
      ]),
    ];
    const wsBatches = XLSX.utils.aoa_to_sheet(batchData);
    XLSX.utils.book_append_sheet(wb, wsBatches, 'Batches');

    // Expenses Sheet
    const expenseData = [
      ['Category', 'Description', 'Amount (₹)', 'Date', 'Batch'],
      ...expenses.map((e) => [
        e.category,
        e.description,
        e.amount,
        new Date(e.date).toLocaleDateString(),
        e.batch?.batchNumber || 'General',
      ]),
    ];
    const wsExpenses = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

    XLSX.writeFile(wb, `ChickFarm_${reportType}_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
    setStatusMsg('Excel workbook exported successfully!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const exportCSV = () => {
    const headers = ['Category', 'Description', 'Amount (₹)', 'Date', 'Batch'];
    const rows = expenses.map((e) => [
      e.category,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.amount,
      new Date(e.date).toLocaleDateString(),
      e.batch?.batchNumber || 'General',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `ChickFarm_${reportType}_Report.csv`;
    link.click();
    setStatusMsg('CSV data file exported!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Farm Audit & Reports Generator
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Generate printable PDF statements, Excel workbooks, and CSV logs
          </p>
        </div>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'daily', title: 'Daily Telemetry', desc: 'Daily mortalities, feed bags consumed & weight logs' },
          { id: 'weekly', title: 'Weekly Performance', desc: '7-day FCR trends and operational expenses' },
          { id: 'monthly', title: 'Monthly Statement', desc: 'Full P&L statement, revenues, and utilities' },
          { id: 'batch', title: 'Batch Audit Report', desc: 'Harvest liftoff, final mortality, and profit per chick' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setReportType(item.id as any)}
            className={`p-5 rounded-3xl border text-left transition-all duration-200 ${
              reportType === item.id
                ? isLiquid
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-emerald-500/10 border-emerald-500 shadow-sm'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--border-hover)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[var(--text-primary)]">{item.title}</span>
              {reportType === item.id && (
                <CheckCircle className={`w-4 h-4 ${isLiquid ? 'text-cyan-400' : 'text-emerald-500'}`} />
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Report Generator Controls */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
              isLiquid ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <FileText className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] capitalize">
              Ready to generate {reportType} report
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Select your export format below. Live data from PostgreSQL/Prisma DB will be processed automatically.
            </p>
          </div>

          {reportType === 'batch' && (
            <div className="text-left max-w-sm mx-auto">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Select Batch for Audit
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              >
                <option value="">All Batches (Full Farm Audit)</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} - {b.batchName || b.breedType}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={exportPDF}
              disabled={downloading}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold text-white transition-all shadow-md ${
                isLiquid
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Document</span>
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-all"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>Export CSV</span>
            </button>
          </div>

          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-fadeIn">
              {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
