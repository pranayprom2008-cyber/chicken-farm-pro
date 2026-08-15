"use client";

import React from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function AuroraBackground() {
  const theme = useFarmStore((state) => state.theme);

  if (theme !== 'obsidian') return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden noise-overlay">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] animate-aurora-1 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[120px] animate-aurora-2 mix-blend-screen" />
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-emerald-300/15 blur-[120px] animate-aurora-3 mix-blend-screen" />
    </div>
  );
}
