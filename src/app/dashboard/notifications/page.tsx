'use client';

import React, { useState, useEffect } from 'react';
import { useFarmStore, NotificationItem } from '@/store/useFarmStore';
import {
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import Modal from '@/components/Modal';

export default function NotificationsPage() {
  const {
    theme,
    notifications,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useFarmStore();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [customType, setCustomType] = useState('info');

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass';

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customMsg) return;
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: customTitle,
        message: customMsg,
        type: customType,
      }),
    });
    setIsModalOpen(false);
    setCustomTitle('');
    setCustomMsg('');
    await fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    await fetchNotifications();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Notifications & Smart Reminders
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Automated alerts for vaccination schedules, feed quotas, electricity bills, and harvests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-input)] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Custom Alert
          </button>
          <button
            onClick={() => markAllNotificationsRead()}
            className={`px-4 py-2 text-xs font-semibold text-white flex items-center gap-1.5 transition-all rounded-xl shadow-md ${
              isLiquid
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={`rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${
          isLiquid ? 'liquid-panel' : 'shadow-sm'
        }`}
      >
        <div className="flex border-b border-[var(--border-color)]">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === tab
                  ? isLiquid
                    ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10'
                    : 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-500/5'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab} ({tab === 'all' ? notifications.length : tab === 'unread' ? notifications.filter(n => !n.isRead).length : notifications.filter(n => n.isRead).length})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-[var(--border-color)]">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              <Bell className="w-8 h-8 mx-auto opacity-30 mb-2" />
              No {filter} notifications found.
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const formattedDate = new Date(n.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead
                      ? isLiquid
                        ? 'bg-cyan-500/[0.03]'
                        : 'bg-emerald-500/[0.03]'
                      : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Custom Alert Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule Custom Farm Reminder"
        >
          <form onSubmit={handleAddCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Reminder Title *
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Brooder Gas Tank Refill"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Type / Priority
              </label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              >
                <option value="info">Info (Standard)</option>
                <option value="warning">Warning (Vaccination / Feed Low)</option>
                <option value="error">Critical (Urgent Alert)</option>
                <option value="success">Success</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Message Details *
              </label>
              <textarea
                rows={3}
                required
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Provide detailed instructions for staff..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
              />
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
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
              >
                Create Alert
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
