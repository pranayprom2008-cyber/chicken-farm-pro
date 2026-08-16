'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Brain, Square, Sparkles } from 'lucide-react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ChickAIVoiceVisualizerProps {
  state: VoiceState;
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
      case 'listening':
        return '🔴 Listening to you...';
      case 'thinking':
        return '✨ ChickAI is thinking...';
      case 'speaking':
        return '🔊 ChickAI is speaking (Tap to pause)';
      case 'idle':
      default:
        return '🎙️ ChickAI Voice Ready';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'listening':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-rose-500/20';
      case 'thinking':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-amber-500/20';
      case 'speaking':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20';
      case 'idle':
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
          <span>✨ CHICKAI VOICE COPILOT</span>
        </span>
        <span className="text-[var(--text-secondary)]">{autoSpeak ? 'AUTO-VOICE: ON' : 'AUTO-VOICE: OFF'}</span>
      </div>

      {/* Central Circular AI Core */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Outer Pulsing Orbital Ring */}
        <motion.div
          className={`absolute w-36 h-36 rounded-full border border-dashed ${
            state === 'listening'
              ? 'border-rose-400/50'
              : state === 'thinking'
              ? 'border-amber-400/60'
              : state === 'speaking'
              ? 'border-emerald-400/60'
              : 'border-teal-400/30'
          }`}
          animate={{
            rotate: state === 'thinking' ? 360 : [0, 180, 360],
            scale: state === 'listening' ? [1, 1.15, 1] : state === 'speaking' ? [1, 1.08, 1] : 1,
          }}
          transition={{
            rotate: { duration: state === 'thinking' ? 3 : 18, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Middle Glowing Ambient Aura */}
        <motion.div
          className={`absolute w-28 h-28 rounded-full blur-md opacity-60 ${
            state === 'listening'
              ? 'bg-rose-500'
              : state === 'thinking'
              ? 'bg-amber-500'
              : state === 'speaking'
              ? 'bg-emerald-500'
              : 'bg-teal-500'
          }`}
          animate={{
            scale: state === 'listening' ? [0.9, 1.25, 0.9] : state === 'speaking' ? [0.95, 1.2, 0.95] : [0.95, 1.05, 0.95],
            opacity: state === 'idle' ? 0.35 : 0.65,
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Inner Interactive Sphere Button */}
        <motion.button
          type="button"
          onClick={state === 'speaking' ? onStopSpeech : onMicClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center border shadow-2xl backdrop-blur-md cursor-pointer transition-colors z-20 ${
            state === 'listening'
              ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-rose-500/40'
              : state === 'thinking'
              ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-amber-500/40'
              : state === 'speaking'
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-emerald-500/40'
              : 'bg-teal-950/80 border-teal-400/60 text-teal-300 shadow-teal-500/30'
          }`}
        >
          {state === 'listening' ? (
            <Mic className="w-8 h-8 animate-bounce text-rose-300" />
          ) : state === 'thinking' ? (
            <Brain className="w-8 h-8 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
          ) : state === 'speaking' ? (
            <div className="flex flex-col items-center gap-1">
              <Square className="w-6 h-6 fill-emerald-300 text-emerald-300" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Stop</span>
            </div>
          ) : (
            <Mic className="w-8 h-8 text-teal-300" />
          )}
        </motion.button>
      </div>

      {/* Futuristic Equalizer Waveform Bars (Active when speaking) */}
      <div className="flex items-center justify-center gap-1.5 h-8 my-2 z-10">
        {[...Array(16)].map((_, i) => {
          const heights = state === 'speaking'
            ? [8, 24, 12, 28, 16, 32, 10, 26, 14, 30, 8, 22, 12, 28, 14, 18]
            : state === 'listening'
            ? [6, 14, 8, 18, 10, 20, 8, 16, 10, 18, 6, 12, 8, 14, 6, 10]
            : [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];

          return (
            <motion.div
              key={`wave-${i}`}
              className={`w-1 rounded-full transition-colors ${
                state === 'speaking'
                  ? 'bg-emerald-400'
                  : state === 'listening'
                  ? 'bg-rose-400'
                  : state === 'thinking'
                  ? 'bg-amber-400'
                  : 'bg-teal-500/40'
              }`}
              animate={{
                height: state === 'speaking' || state === 'listening'
                  ? [heights[i], heights[(i + 4) % heights.length], heights[(i + 8) % heights.length], heights[i]]
                  : heights[i],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.05,
              }}
            />
          );
        })}
      </div>

      {/* Live State Badge */}
      <div className={`mt-2 px-4 py-1.5 rounded-full border text-xs font-bold shadow-lg transition-all z-10 ${getStatusColor()}`}>
        {getStatusText()}
      </div>

      {/* Real-time transcribed text preview */}
      {transcript && (
        <div className="mt-3 px-4 py-2 rounded-xl bg-neutral-900/90 border border-[var(--border-color)] max-w-sm text-center text-xs text-[var(--text-primary)] italic font-mono z-10">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
