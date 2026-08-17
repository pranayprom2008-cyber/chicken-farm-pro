'use client';

import React, { useEffect, useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function LiquidBackground() {
  const { theme } = useFarmStore();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const isSpatial = theme === 'spatial' || theme === 'spatial-glass';
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      setIsTouchDevice(touch);

      if (!touch) {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            setMousePos({ x: e.clientX, y: e.clientY });
          });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          cancelAnimationFrame(rafId);
        };
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── 🥽 Theme: visionOS Spatial Immersion Environment ── */}
      {isSpatial && (
        <>
          {/* Spatial Delicate Perspective Grid */}
          <div className="absolute inset-0 spatial-grid-canvas opacity-45" />

          {/* Warm Interior Studio / Horizon Ambient Lighting (Top-Right) */}
          <div
            className="absolute -top-[18%] -right-[10%] w-[500px] sm:w-[850px] h-[500px] sm:h-[850px] rounded-full opacity-35 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(251, 146, 60, 0.28) 0%, rgba(217, 119, 6, 0.12) 45%, transparent 70%)',
              filter: 'blur(110px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {/* VisionOS Sky-Cyan Atmosphere (Top-Left) */}
          <div
            className="absolute -top-[12%] -left-[12%] w-[480px] sm:w-[800px] h-[480px] sm:h-[800px] rounded-full opacity-30 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.38) 0%, rgba(2, 132, 199, 0.15) 50%, transparent 75%)',
              filter: 'blur(100px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {/* Deep Forest Emerald Ground Atmosphere (Bottom-Center) */}
          <div
            className="absolute -bottom-[22%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[1100px] h-[500px] sm:h-[800px] rounded-full opacity-25 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(13, 148, 136, 0.15) 50%, transparent 75%)',
              filter: 'blur(120px)',
            }}
          />

          {/* Interactive VisionOS Specular Cursor Orb */}
          {!isTouchDevice && (
            <div
              className="absolute w-[500px] h-[500px] rounded-full opacity-22 transition-transform duration-75 ease-out will-change-transform pointer-events-none"
              style={{
                transform: `translate3d(${mousePos.x - 250}px, ${mousePos.y - 250}px, 0)`,
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, rgba(251, 146, 60, 0.15) 45%, transparent 70%)',
                filter: 'blur(75px)',
              }}
            />
          )}
        </>
      )}

      {/* ── 🌙 Theme: Dark Forest Atmosphere ── */}
      {isDark && (
        <>
          <div
            className="absolute -top-[15%] -left-[10%] w-[360px] sm:w-[600px] h-[360px] sm:h-[600px] rounded-full opacity-12 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #15803D 0%, transparent 70%)',
              filter: 'blur(85px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[380px] sm:w-[640px] h-[380px] sm:h-[640px] rounded-full opacity-10 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, #047857 0%, transparent 70%)',
              filter: 'blur(85px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </>
      )}

      {/* ── ☀️ Theme: Daylight Clean Green ── */}
      {!isDark && !isSpatial && (
        <div
          className="absolute -top-[10%] -left-[10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-10 animate-blob-1 will-change-transform"
          style={{
            background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
            filter: 'blur(75px)',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      )}
    </div>
  );
}
