'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Brain, Square, Sparkles, CheckCircle2, XCircle, Clock, Check } from 'lucide-react';
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
        return '🔴 Listening to you...';
      case 'THINKING':
        return '🧠 Thinking...';
      case 'SPEAKING':
        return '🔊 Speaking (Tap to stop)';
      case 'WAITING_FOR_CONFIRMATION':
        return '⏳ Waiting for confirmation (Say "Yes" or "Cancel")';
      case 'WAITING_FOR_INFORMATION':
        return '❓ Waiting for category or batch';
      case 'EXECUTING_ACTION':
        return '⚡ Updating farm database...';
      case 'ACTION_COMPLETED':
        return '✓ Action executed successfully';
      case 'CANCELLED':
        return '↩ Action cancelled';
      case 'IDLE':
      default:
        return '● Ready for commands';
    }
  };

  const getStatusColor = () => {
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
    <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-neutral-950/80 border border-[var(--border-color)] backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Background Holographic Hex Grid & Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-teal-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Floating Holographic Ring Particles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="w-full flex items-center justify-between text-[10px] tracking-widest text-[var(--text-muted)] uppercase mb-4 z-10 font-mono">
        <span className="flex items-center gap-1.5 text-teal-300 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>✨ CHICKAI CONVERSATIONAL COPILOT</span>
        </span>
        <span className="text-[var(--text-secondary)]">{autoSpeak ? 'AUTO-VOICE: ON' : 'AUTO-VOICE: OFF'}</span>
      </div>

      {/* Central Circular AI Core */}
      <div className="relative flex items-center justify-center my-4">
        {/* Outer Orbital Ring 1 */}
        <motion.div
          animate={{
            rotate: 360,
            scale: state === 'SPEAKING' ? [1, 1.08, 1] : state === 'LISTENING' ? [1, 1.15, 1] : 1,
          }}
          transition={{
            rotate: { duration: state === 'SPEAKING' ? 6 : 14, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`w-36 h-36 rounded-full border border-dashed pointer-events-none ${
            state === 'LISTENING'
              ? 'border-rose-400/60 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
              : state === 'SPEAKING'
              ? 'border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
              : state === 'THINKING' || state === 'EXECUTING_ACTION'
              ? 'border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
              : 'border-teal-500/30'
          }`}
        />

        {/* Outer Orbital Ring 2 */}
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-44 h-44 rounded-full border border-dotted border-white/10 pointer-events-none"
        />

        {/* Central Core Sphere Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={state === 'SPEAKING' ? onStopSpeech : onMicClick}
          className={`relative z-20 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl ${
            state === 'LISTENING'
              ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-rose-400 text-white shadow-rose-500/40 ring-4 ring-rose-400/30'
              : state === 'SPEAKING'
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-emerald-500/40 ring-4 ring-emerald-400/30'
              : state === 'THINKING' || state === 'EXECUTING_ACTION'
              ? 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 text-white shadow-amber-500/40 ring-4 ring-amber-400/30'
              : state === 'WAITING_FOR_CONFIRMATION'
              ? 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 text-white shadow-cyan-500/40 ring-4 ring-cyan-400/30'
              : 'bg-gradient-to-tr from-neutral-800 via-neutral-900 to-teal-950 border border-teal-500/40 text-teal-300 hover:border-teal-400'
          }`}
          title={
            state === 'SPEAKING'
              ? 'Tap to Interrupt / Stop Speaking'
              : state === 'LISTENING'
              ? 'Tap to Finish Speaking'
              : 'Tap to Speak'
          }
        >
          {state === 'LISTENING' && (
            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Mic className="w-8 h-8" />
            </motion.div>
          )}

          {state === 'THINKING' && (
            <Brain className="w-8 h-8 animate-spin [animation-duration:4s]" />
          )}

          {state === 'SPEAKING' && (
            <div className="flex flex-col items-center gap-1">
              <Square className="w-6 h-6 fill-white text-white" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Stop</span>
            </div>
          )}

          {state === 'WAITING_FOR_CONFIRMATION' && (
            <Clock className="w-8 h-8 animate-pulse" />
          )}

          {state === 'ACTION_COMPLETED' && (
            <Check className="w-8 h-8" />
          )}

          {state === 'CANCELLED' && (
            <XCircle className="w-8 h-8" />
          )}

          {state === 'IDLE' && (
            <Mic className="w-8 h-8 text-teal-400" />
          )}
        </motion.button>
      </div>

      {/* Dynamic 16-Band Audio Frequency Equalizer Waveform */}
      <div className="flex items-center justify-center gap-1 h-8 my-2 z-10 w-full max-w-[280px]">
        {[...Array(16)].map((_, i) => {
          const isSpeaking = state === 'SPEAKING';
          const isListening = state === 'LISTENING';
          const isThinking = state === 'THINKING' || state === 'EXECUTING_ACTION';

          const height = isSpeaking
            ? [10, 28, 14, 32, 18, 24, 12, 30, 22, 16, 26, 14, 28, 20, 12, 18][i % 16]
            : isListening
            ? [6, 18, 12, 22, 16, 14, 20, 12, 16, 10, 18, 12, 14, 8, 12, 6][i % 16]
            : isThinking
            ? [8, 12, 8, 16, 8, 12, 8, 16, 8, 12, 8, 16, 8, 12, 8, 12][i % 16]
            : 4;

          return (
            <motion.div
              key={i}
              animate={{
                height: [height * 0.4, height, height * 0.4],
              }}
              transition={{
                duration: isSpeaking ? 0.35 + (i % 4) * 0.1 : 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.04,
              }}
              className={`w-1 rounded-full ${
                isListening
                  ? 'bg-rose-400'
                  : isSpeaking
                  ? 'bg-emerald-400'
                  : isThinking
                  ? 'bg-amber-400'
                  : 'bg-teal-500/30'
              }`}
              style={{ minHeight: 4 }}
            />
          );
        })}
      </div>

      {/* Live Interim Transcript or Prompt Helper */}
      <div className="min-h-7 flex items-center justify-center text-center px-4 z-10 mt-1">
        {transcript ? (
          <motion.p
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono text-teal-200 bg-teal-950/70 border border-teal-400/30 px-3 py-1 rounded-full shadow-sm"
          >
            "{transcript}"
          </motion.p>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)] italic">
            {state === 'SPEAKING'
              ? 'Say "Stop", "Wait", or tap the core to interrupt'
              : state === 'WAITING_FOR_CONFIRMATION'
              ? 'Say "Yes" to save or "Cancel" to discard'
              : state === 'LISTENING'
              ? 'Speaking... ChickAI is actively listening'
              : 'Say or type commands naturally'}
          </p>
        )}
      </div>

      {/* Bottom Status Capsule Badge */}
      <div className="mt-3 z-10">
        <span
          className={`px-3.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 shadow-md ${getStatusColor()}`}
        >
          <span>{getStatusText()}</span>
        </span>
      </div>
    </div>
  );
}
