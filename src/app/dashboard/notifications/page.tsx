"use client";
import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { Bell, Check, CheckCircle2, AlertTriangle, XCircle, Info, Trash2, Plus } from 'lucide-react';

export default function NotificationsPage() {
  const { theme, notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, addNotification } = useFarmStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Auto-generate some sample notifications if empty on first load
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification({
        title: "Welcome to ChickFarm Pro!",
        message: "Your farm management dashboard is ready.",
        type: "success"
      });
      addNotification({
        title: "Daily Reminder",
        message: "Remember to update daily mortality records.",
        type: "info"
      });
      addNotification({
        title: "Health Check",
        message: "Check your batch health reports regularly.",
        type: "warning"
      });
    }
  }, [notifications.length, addNotification]);

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/10';
      case 'warning': return 'bg-amber-500/10';
      case 'error': return 'bg-red-500/10';
      default: return 'bg-blue-500/10';
    }
  };

  const handleCreateTest = () => {
    const types: ('info' | 'success' | 'warning' | 'error')[] = ['info', 'success', 'warning', 'error'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    addNotification({
      title: "Test Notification",
      message: `This is a test notification of type ${randomType}`,
      type: randomType
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
          </h1>
          <p className="text-[var(--text-secondary)]">Stay updated with your farm activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreateTest}
            className="px-3 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Test
          </button>
          <button 
            onClick={() => markAllNotificationsRead()}
            className={`px-4 py-2 text-white flex items-center gap-2 transition-all duration-200 rounded-xl ${
              theme === 'obsidian' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            <Check className="w-5 h-5" /> Mark All Read
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
        <div className="flex border-b border-[var(--border-color)]">
          {(['all', 'unread', 'read'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
                filter === tab 
                  ? 'text-emerald-500 border-b-2 border-emerald-500 bg-[var(--bg-primary)]/50' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/50 hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifs.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex items-start gap-4 transition-colors ${!notif.read ? 'bg-[var(--bg-primary)]/40' : 'hover:bg-[var(--bg-primary)]/20'}`}
                onClick={() => !notif.read && markNotificationRead(notif.id)}
              >
                <div className={`p-2 rounded-xl mt-1 shrink-0 ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`font-medium ${!notif.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{notif.message}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
