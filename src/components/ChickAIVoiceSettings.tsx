'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Volume2, Mic, Sparkles, Sun, Check, Play } from 'lucide-react';
import { VoiceSettings } from '@/lib/chickai/voice';

interface ChickAIVoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  onTestVoice: () => void;
}

export default function ChickAIVoiceSettings({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestVoice,
}: ChickAIVoiceSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md p-6 rounded-3xl bg-neutral-900/95 border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">ChickAI Voice Settings</h3>
              <p className="text-xs text-[var(--text-muted)]">Customize cinematic persona, pitch & cadence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Voice Persona
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'futuristic-male', label: 'Futuristic Male', desc: 'Calm, deep & cinematic' },
              { id: 'professional-male', label: 'Professional Male', desc: 'Natural & confident' },
              { id: 'futuristic-female', label: 'Futuristic Female', desc: 'Sleek & polished' },
              { id: 'professional-female', label: 'Professional Female', desc: 'Warm & executive' },
            ].map((p) => {
              const isSelected = settings.voicePersona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onUpdateSettings({ voicePersona: p.id as any })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                      : 'bg-neutral-800/60 border-neutral-700/60 text-[var(--text-secondary)] hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{p.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider">Speaking Rate</span>
            <span className="font-mono text-teal-400 font-bold">{settings.speed}x</span>
          </div>
          <div className="flex items-center gap-2">
            {[0.8, 0.95, 1.0, 1.1, 1.2].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onUpdateSettings({ speed: val })}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  settings.speed === val
                    ? 'bg-teal-500 text-black border-teal-400 shadow-sm'
                    : 'bg-neutral-800/80 border-neutral-700/60 text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {val}x
              </button>
            ))}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider">Audio Volume</span>
            <span className="font-mono text-teal-400 font-bold">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Auto-Speak Responses</span>
              <span className="text-[10px] text-[var(--text-muted)]">Speak ChickAI answers aloud automatically</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
              className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Voice Commands Enabled</span>
              <span className="text-[10px] text-[var(--text-muted)]">Allow microphone voice input and voice confirmations</span>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceCommands}
              onChange={(e) => onUpdateSettings({ voiceCommands: e.target.checked })}
              className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Test Voice & Close Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onTestVoice}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-teal-300 border border-teal-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-teal-300" />
            <span>Test Voice Persona</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-xs font-bold text-black shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
