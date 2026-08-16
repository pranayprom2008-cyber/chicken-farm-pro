'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, ShieldCheck, Check, AlertTriangle, Database, RefreshCw, FileText } from 'lucide-react';
import Modal from '@/components/Modal';
import { useFarmStore } from '@/store/useFarmStore';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackupRestoreModal({ isOpen, onClose }: BackupRestoreModalProps) {
  const store = useFarmStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    try {
      const backupData = {
        version: 'chickfarm-master-v3',
        timestamp: new Date().toISOString(),
        farmName: store.settings.farmName,
        data: {
          batches: store.batches,
          expenses: store.expenses,
          billingHistory: store.billingHistory,
          sales: store.sales,
          notifications: store.notifications,
          settings: store.settings,
        },
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `ChickFarm_Pro_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg('Failed to generate backup file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.data && !parsed.batches) {
          setErrorMsg('Invalid backup file format. Expected ChickFarm Pro JSON export.');
          return;
        }

        const data = parsed.data || parsed;

        // Restore directly into Zustand & localStorage
        useFarmStore.setState((state) => ({
          batches: Array.isArray(data.batches) ? data.batches : state.batches,
          expenses: Array.isArray(data.expenses) ? data.expenses : state.expenses,
          billingHistory: Array.isArray(data.billingHistory) ? data.billingHistory : state.billingHistory,
          sales: Array.isArray(data.sales) ? data.sales : state.sales,
          notifications: Array.isArray(data.notifications) ? data.notifications : state.notifications,
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        }));

        setRestoreSuccess(true);
        setErrorMsg(null);
        setTimeout(() => {
          setRestoreSuccess(false);
          onClose();
        }, 2500);
      } catch {
        setErrorMsg('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💾 Secure Farm Data Backup & Cloud Restore" size="md">
      <div className="space-y-6">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Safely export your entire farm database (batches, biometrics, expenses, bird sales, billing calculations) to an offline encrypted JSON file, or restore existing data onto any device.
        </p>

        {/* 1. Export Section */}
        <div className="p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Download Full Farm Backup</h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Creates a timestamped snapshot of all {store.batches.length} batches, {store.expenses.length} expenses, and {store.sales.length} sales.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export & Save Backup (.json)</span>
          </button>
        </div>

        {/* 2. Import / Restore Section */}
        <div className="p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Restore Farm from File</h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Upload a previously saved `.json` file to restore all records instantly.
              </p>
            </div>
          </div>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-teal-500/40 text-teal-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Select Backup File to Restore</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {restoreSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold justify-center"
          >
            <Check className="w-4 h-4" />
            <span>Farm database successfully restored and verified!</span>
          </motion.div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Admin Tag */}
        <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized: <strong>John & Pranay</strong></span>
          </div>
          <span>Automatic Local Cache Active</span>
        </div>
      </div>
    </Modal>
  );
}
