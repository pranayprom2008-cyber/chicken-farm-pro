'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Brain, Square, Sparkles, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { ConversationState } from '@/lib/chickai/types';

interface ChickAIVoiceVisualizerProps {
  state: ConversationState;
  onMicClick: () => void;
  onStopSpeech: () => void;
  transcript?: string;
  autoSpeak: boolean;
}

export default function ChickAIVoiceVisualizer({
  state,
  onMicClick,
  onStopSpeech,
  transcript,
  autoSpeak,
}: ChickAIVoiceVisualizerProps) {
  const getStatusText = () => {
    switch (state) {
      case 'LISTENING':
        return 'Listening to your voice...';
      case 'THINKING':
        return 'Analyzing biometrics & records...';
      case 'SPEAKING':
        return 'Speaking telemetry (Tap to interrupt)';
      case 'WAITING_FOR_CONFIRMATION':
        return 'Awaiting confirmation ("Yes, save" or "Cancel")';
      case 'WAITING_FOR_INFORMATION':
        return 'Please specify batch or expense category';
      case 'EXECUTING_ACTION':
        return 'Writing live updates to database...';
      case 'ACTION_COMPLETED':
        return '✓ Database transaction completed';
      case 'CANCELLED':
        return 'Action cancelled';
      case 'IDLE':
      default:
        return 'Spatial AI Command Center Ready';
    }
  };

  const getStatusBadgeColor = () => {
    switch (state) {
      case 'LISTENING':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-rose-500/20';
      case 'THINKING':
      case 'EXECUTING_ACTION':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-amber-500/20';
      case 'SPEAKING':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20';
      case 'WAITING_FOR_CONFIRMATION':
      case 'WAITING_FOR_INFORMATION':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-cyan-500/20';
      case 'ACTION_COMPLETED':
        return 'text-green-400 border-green-500/40 bg-green-500/10 shadow-green-500/20';
      case 'CANCELLED':
        return 'text-slate-400 border-slate-500/40 bg-slate-500/10 shadow-slate-500/20';
      case 'IDLE':
      default:
        return 'text-teal-400 border-teal-500/40 bg-teal-500/10 shadow-teal-500/20';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] backdrop-blur-2xl overflow-hidden shadow-2xl spatial-glass">
      {/* Background Holographic Hex Grid & Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-teal-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Floating Holographic Ambient Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* ── Spatial Glass Header ── */}
      <div className="w-full flex items-center justify-between text-[11px] tracking-widest text-[var(--text-muted)] uppercase mb-4 z-10 font-mono">
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>✨ CHICKAI</span>
          </span>
          <span className="text-[9px] text-[var(--text-muted)] tracking-wider">
            FARM INTELLIGENCE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </span>
        </div>
      </div>

      {/* ── Central Holographic AI Core ── */}
      <div className="relative flex items-center justify-center my-4">
        {/* Outer Orbital Ring 1 (Rotating) */}
        <motion.div
          animate={{
            rotate: 360,
            scale: state === 'SPEAKING' ? [1, 1.08, 1] : state === 'LISTENING' ? [1, 1.15, 1] : 1,
          }}
          transition={{
            rotate: { duration: state === 'SPEAKING' ? 6 : state === 'THINKING' ? 4 : 14, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`w-36 h-36 rounded-full border border-dashed pointer-events-none ${
            state === 'LISTENING'
              ? 'border-rose-400/60 shadow-lg shadow-rose-500/20'
              : state === 'SPEAKING'
              ? 'border-emerald-400/60 shadow-lg shadow-emerald-500/25'
              : state === 'THINKING' || state === 'EXECUTING_ACTION'
              ? 'border-amber-400/60 shadow-lg shadow-amber-500/25'
              : 'border-teal-500/30'
          }`}
        />

        {/* Outer Orbital Ring 2 (Counter-Rotating) */}
        <motion.div
          animate={{
            rotate: -360,
            scale: state === 'SPEAKING' ? [1.05, 1, 1.05] : 1,
          }}
          transition={{
            rotate: { duration: state === 'THINKING' ? 5 : 18, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute w-28 h-28 rounded-full border border-dotted border-white/15 pointer-events-none"
        />

        {/* Expanding Waveform Rings when Speaking/Listening */}
        {(state === 'SPEAKING' || state === 'LISTENING') && (
          <motion.div
            animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className={`absolute w-24 h-24 rounded-full border ${
              state === 'LISTENING' ? 'border-rose-400' : 'border-emerald-400'
            }`}
          />
        )}

        {/* Inner Interactive AI Core Button */}
        <button
          onClick={state === 'SPEAKING' ? onStopSpeech : onMicClick}
          className={`relative z-20 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
            state === 'LISTENING'
              ? 'bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-rose-500/40 ring-4 ring-rose-500/30 scale-105 animate-pulse'
              : state === 'SPEAKING'
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/30 hover:scale-105'
              : state === 'THINKING' || state === 'EXECUTING_ACTION'
              ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-white shadow-amber-500/40 ring-4 ring-amber-500/30 animate-spin'
              : 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-teal-500/30 hover:scale-105 hover:shadow-teal-500/50'
          }`}
          title={
            state === 'SPEAKING'
              ? 'Click to stop speaking'
              : state === 'LISTENING'
              ? 'Listening... Click to cancel'
              : 'Click to speak to ChickAI'
          }
        >
          {state === 'LISTENING' ? (
            <Mic className="w-8 h-8" />
          ) : state === 'SPEAKING' ? (
            <Volume2 className="w-8 h-8" />
          ) : state === 'THINKING' ? (
            <Brain className="w-8 h-8" />
          ) : state === 'EXECUTING_ACTION' ? (
            <Zap className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Audio Reactive Frequency Waveform Bar (When Speaking) */}
      {state === 'SPEAKING' && (
        <div className="flex items-center gap-1.5 my-2">
          {[40, 75, 100, 60, 90, 45, 80, 50].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: ['4px', `${h * 0.22}px`, '4px'] }}
              transition={{
                duration: 0.5 + (i % 3) * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-1 bg-emerald-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Real-time Status Badge & Transcript */}
      <div className="mt-2 text-center max-w-md z-10 space-y-2">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-all duration-300 ${getStatusBadgeColor()}`}
        >
          {state === 'SPEAKING' && <Square className="w-3 h-3 fill-current cursor-pointer" onClick={onStopSpeech} />}
          <span>{getStatusText()}</span>
        </div>

        {transcript && (
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-[var(--text-primary)] font-medium max-w-sm mx-auto shadow-inner">
            <span className="text-[10px] text-teal-400 font-bold uppercase block mb-0.5 font-mono">
              Live Speech Input:
            </span>
            &ldquo;{transcript}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
