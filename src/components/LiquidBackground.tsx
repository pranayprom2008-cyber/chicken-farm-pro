'use client';

import React, { useEffect, useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function LiquidBackground() {
  const { theme } = useFarmStore();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const isLiquid = theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass';
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      setIsTouchDevice(touch);

      if (!touch) {
        const handleMouseMove = (e: MouseEvent) => {
          setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── Theme: Liquid Glass Ambient Aura & 3D Interactive Spotlight ── */}
      {isLiquid && (
        <>
          <div
            className="absolute -top-[15%] -left-[10%] w-[380px] sm:w-[680px] h-[380px] sm:h-[680px] rounded-full opacity-25 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #8B5CF6 0%, #06B6D4 50%, transparent 70%)',
              filter: 'blur(75px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[400px] sm:w-[720px] h-[400px] sm:h-[720px] rounded-full opacity-22 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #00E5FF 0%, #10B981 50%, transparent 70%)',
              filter: 'blur(80px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {!isTouchDevice && (
            <div
              className="absolute w-[420px] h-[420px] rounded-full opacity-15 transition-transform duration-100 ease-out will-change-transform"
              style={{
                transform: `translate3d(${mousePos.x - 210}px, ${mousePos.y - 210}px, 0)`,
                background: 'radial-gradient(circle, rgba(0, 229, 255, 0.4) 0%, rgba(139, 92, 246, 0.15) 45%, transparent 70%)',
                filter: 'blur(55px)',
              }}
            />
          )}
        </>
      )}

      {/* ── Theme: Dark Theme Ambient Aura ── */}
      {isDark && (
        <>
          <div
            className="absolute -top-[10%] -left-[5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full opacity-15 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #22C55E 0%, #0F766E 50%, transparent 70%)',
              filter: 'blur(70px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
          <div
            className="absolute -bottom-[15%] right-[0%] w-[320px] sm:w-[550px] h-[320px] sm:h-[550px] rounded-full opacity-12 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
              filter: 'blur(75px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </>
      )}

      {/* ── Theme: Light Theme Ambient Aura ── */}
      {!isDark && !isLiquid && (
        <>
          <div
            className="absolute -top-[10%] right-[5%] w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] rounded-full opacity-35 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #FEF08A 0%, #BBF7D0 50%, transparent 70%)',
              filter: 'blur(70px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
          <div
            className="absolute -bottom-[10%] left-[5%] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full opacity-30 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #DCFCE7 0%, transparent 70%)',
              filter: 'blur(70px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </>
      )}
    </div>
  );
}
