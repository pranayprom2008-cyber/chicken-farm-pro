"use client";

import { useFarmStore } from '@/store/useFarmStore';
import { Settings, Save, Download, Trash2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, settings, theme, updateSettings, setTheme, logout } = useFarmStore();
  const router = useRouter();

  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm p-6 ${theme === 'obsidian' ? 'obsidian-glass' : ''}`;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl">
          <Settings size={24} />
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold mb-4 border-b border-[var(--border-color)] pb-2">Farm Settings</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Farm Name</label>
            <input 
              type="text" 
              defaultValue={settings.farmName}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select 
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="₹">₹ (INR)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-all duration-200">
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold mb-4 border-b border-[var(--border-color)] pb-2">Appearance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-[var(--border-color)] hover:border-gray-400'}`}
          >
            <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center border border-gray-200">
              <div className="w-1/2 h-1/2 bg-white rounded shadow-sm flex flex-col gap-1 p-2">
                <div className="w-full h-2 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-2 bg-blue-100 rounded"></div>
              </div>
            </div>
            <span className="font-medium">Light</span>
          </button>

          <button 
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-[var(--border-color)] hover:border-gray-500'}`}
          >
            <div className="w-full h-24 bg-gray-900 rounded-lg mb-3 flex items-center justify-center border border-gray-700">
              <div className="w-1/2 h-1/2 bg-gray-800 rounded shadow-sm flex flex-col gap-1 p-2">
                <div className="w-full h-2 bg-gray-700 rounded"></div>
                <div className="w-2/3 h-2 bg-blue-900 rounded"></div>
              </div>
            </div>
            <span className="font-medium">Dark</span>
          </button>

          <button 
            onClick={() => setTheme('obsidian')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'obsidian' ? 'border-violet-500 bg-violet-500/10' : 'border-[var(--border-color)] hover:border-violet-500/50'}`}
          >
            <div className="w-full h-24 bg-gray-950 rounded-lg mb-3 flex items-center justify-center border border-gray-800 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 backdrop-blur-xl"></div>
              <div className="w-1/2 h-1/2 bg-gray-900/50 rounded shadow-sm flex flex-col gap-1 p-2 relative z-10 border border-white/10">
                <div className="w-full h-2 bg-white/20 rounded"></div>
                <div className="w-2/3 h-2 bg-cyan-500/30 rounded"></div>
              </div>
            </div>
            <span className="font-medium bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Obsidian Aurora</span>
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold mb-4 border-b border-[var(--border-color)] pb-2">Account & Data</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Signed in as</p>
            <p className="font-medium">{user?.name} ({user?.email})</p>
            <button onClick={handleLogout} className="mt-2 flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm font-medium">
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border-color)]">
            <button className="flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-4 py-2 rounded-xl transition-all duration-200">
              <Download size={18} />
              <span>Export Data (CSV)</span>
            </button>
            <button className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-xl transition-all duration-200">
              <Trash2 size={18} />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
