'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore, Theme } from '@/store/useFarmStore';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Trash2,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Glasses,
  CheckCircle,
  Database,
  ShieldCheck,
  UserCheck,
  CircleDot
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import TiltCard from '@/components/TiltCard';
import BackupRestoreModal from '@/components/BackupRestoreModal';

export default function SettingsPage() {
  const {
    user,
    settings,
    theme,
    setTheme,
    saveSettings,
    logout,
    fetchSettings,
  } = useFarmStore();

  const router = useRouter();

  const [farmName, setFarmName] = useState(settings.farmName || 'GreenField Bio-Secure Poultry Farm');
  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [language, setLanguage] = useState(settings.language || 'en');
  const [location, setLocation] = useState(settings.location || 'Hyderabad, India');
  const [savedMsg, setSavedMsg] = useState('');
  const [showBackupModal, setShowBackupModal] = useState(false);

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      farmName,
      currency,
      language,
      location,
      theme,
    });
    setSavedMsg('Farm configuration saved to database successfully!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const handleBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      farmName,
      currency,
      theme,
      exportedBy: user?.name,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChickFarm_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            System & Farm Settings
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Configure farm profile, multi-currency display, theme engine, and data backups
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Farm Profile Settings Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-500" />
          Farm Profile Configuration
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Farm Name *
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Farm Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (Emirati Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                System Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              >
                <option value="en">English (Default)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md ${
                isLiquid
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>

            {savedMsg && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle className="w-4 h-4" /> {savedMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 3 Theme Appearance Switcher */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Appearance & Theme Engine
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Select between three meticulously crafted visual styles:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
                : 'border-[var(--border-color)] hover:border-emerald-500/30'
            }`}
          >
            <div className="w-full h-20 bg-white rounded-xl mb-3 border border-gray-200 flex flex-col justify-between p-2.5 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="w-8 h-2 rounded bg-gray-200" />
              </div>
              <div className="w-16 h-3 rounded bg-amber-100" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--text-primary)]">Light</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Crisp White, Farm Green & Light Yellow
            </p>
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/20'
                : 'border-[var(--border-color)] hover:border-emerald-500/30'
            }`}
          >
            <div className="w-full h-20 bg-[#0A120E] rounded-xl mb-3 border border-[#1C382B] flex flex-col justify-between p-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="w-8 h-2 rounded bg-[#15271F]" />
              </div>
              <div className="w-16 h-3 rounded bg-[#1C382B]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--text-primary)]">Dark</span>
              <Moon className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Deep Forest Charcoal with Emerald highlights
            </p>
          </button>

          {/* Spatial Glass Theme */}
          <button
            type="button"
            onClick={() => setTheme('spatial')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'spatial' || theme === 'spatial-glass'
                ? 'border-sky-400 ring-2 ring-sky-500/30 bg-sky-950/20 shadow-lg'
                : 'border-[var(--border-color)] hover:border-sky-500/40'
            }`}
          >
            <div className="w-full h-20 bg-[#06090E] rounded-xl mb-3 border border-white/20 flex flex-col justify-between p-2.5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-white/5 backdrop-blur-md pointer-events-none" />
              <div className="flex gap-1 relative z-10">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="w-8 h-2 rounded bg-white/30" />
              </div>
              <div className="w-16 h-3 rounded bg-sky-500/40 relative z-10" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-sky-300">Spatial Glass</span>
              <Glasses className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Apple visionOS clean optical glass & spatial room depth
            </p>
          </button>

          {/* Vibe Theme */}
          <button
            type="button"
            onClick={() => setTheme('vibe')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === 'vibe'
                ? 'border-purple-400 ring-2 ring-purple-500/30 bg-purple-950/20 shadow-lg'
                : 'border-[var(--border-color)] hover:border-purple-500/40'
            }`}
          >
            <div className="w-full h-20 bg-[#070512] rounded-xl mb-3 border border-purple-500/30 flex flex-col justify-between p-2.5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/25 to-pink-500/20 backdrop-blur-md pointer-events-none" />
              <div className="flex gap-1 relative z-10">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="w-8 h-2 rounded bg-purple-300/30" />
              </div>
              <div className="w-16 h-3 rounded bg-pink-500/40 relative z-10" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-300">Vibe</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Cyber sunset aura, twilight nebula & neon accents
            </p>
          </button>
        </div>
      </div>

      {/* Authorized Farm Administrators (Exclusive Access) */}
      <TiltCard maxTilt={8} glare={true}>
        <div
          className={`p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
            isLiquid ? 'liquid-panel' : 'shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Authorized Farm Administrators
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Strict 2-Admin Access
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            System security is hard-locked to the following two verified phone administrator accounts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-extrabold text-sm">
                  J
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">John</h3>
                  <span className="text-xs text-amber-400 font-semibold block">Farm Owner</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">+91 9502828293</span>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-extrabold text-sm">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Pranay</h3>
                  <span className="text-xs text-cyan-400 font-semibold block">Manager & Tech Lead</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">+91 9849852085</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Security & Backup Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Database Backup & Export
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Download complete biometric and financial snapshots for offline records.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBackupModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Open Backup & Cloud Restore Manager</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset All to Zero */}
      <div
        className="p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Reset All Farm Records to Zero
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Permanently clears all batches, expenses, daily logs, sales receipts, and telemetry to start fresh with a clean slate (0).
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm('⚠️ ARE YOU SURE?\n\nThis will permanently delete all batches, expenses, sales, and reset the entire farm database to 0 so you can start fresh.')) {
                const { resetAllData } = useFarmStore.getState();
                await resetAllData();
                alert('✅ All farm records have been reset to zero. You are now starting fresh!');
                router.push('/dashboard');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All to Zero</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
    </div>
  );
}
