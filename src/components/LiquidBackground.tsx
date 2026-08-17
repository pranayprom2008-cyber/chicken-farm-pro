'use client';

import React, { useEffect, useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function LiquidBackground() {
  const { theme } = useFarmStore();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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
      {/* ── Level 1: Spatial Technical Grid Canvas ── */}
      <div className="absolute inset-0 spatial-grid-canvas opacity-35" />

      {/* ── Top-Left Ambient Emerald/Forest Glow Orb ── */}
      <div
        className="absolute -top-[12%] -left-[10%] w-[380px] sm:w-[650px] h-[380px] sm:h-[650px] rounded-full opacity-20 animate-blob-1 will-change-transform pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(13, 148, 136, 0.2) 45%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* ── Bottom-Right Ambient Cyan/Teal Glow Orb ── */}
      <div
        className="absolute -bottom-[15%] -right-[8%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] rounded-full opacity-18 animate-blob-2 will-change-transform pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
          filter: 'blur(90px)',
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* ── Center Soft Deep Horizon Light ── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[1000px] h-[300px] sm:h-[450px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.3) 0%, transparent 70%)',
          filter: 'blur(95px)',
        }}
      />

      {/* ── Interactive Cursor Spatial Ambient Spotlight ── */}
      {!isTouchDevice && (
        <div
          className="absolute w-[450px] h-[450px] rounded-full opacity-12 transition-transform duration-75 ease-out will-change-transform pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x - 225}px, ${mousePos.y - 225}px, 0)`,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(20, 184, 166, 0.2) 45%, transparent 70%)',
            filter: 'blur(65px)',
          }}
        />
      )}
    </div>
  );
}
