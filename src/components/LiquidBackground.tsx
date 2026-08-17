'use client';

import React, { useEffect, useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function LiquidBackground() {
  const { theme } = useFarmStore();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const isSpatial = theme === 'spatial' || theme === 'spatial-glass';
  const isVibe = theme === 'vibe';
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
      {/* ── 🥽 Theme: Clean Apple Vision Pro Spatial UI (No Green, Pure Optical Glass Depth) ── */}
      {isSpatial && (
        <>
          {/* Spatial Delicate Perspective Depth Canvas */}
          <div className="absolute inset-0 spatial-grid-canvas opacity-35" />

          {/* Clean Studio Horizon Ambient Light (Top-Right: Warm Crystal Studio) */}
          <div
            className="absolute -top-[16%] -right-[12%] w-[500px] sm:w-[850px] h-[500px] sm:h-[850px] rounded-full opacity-25 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 70%)',
              filter: 'blur(110px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {/* Clean Optical Sky-Cyan Atmosphere (Top-Left: Pure Ice Cyan) */}
          <div
            className="absolute -top-[14%] -left-[14%] w-[500px] sm:w-[820px] h-[500px] sm:h-[820px] rounded-full opacity-35 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 75%)',
              filter: 'blur(100px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {/* Subtle Deep Slate Blue Ambient Horizon (Bottom: Pure Deep Navy) */}
          <div
            className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[1100px] h-[500px] sm:h-[750px] rounded-full opacity-20 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.2) 55%, transparent 75%)',
              filter: 'blur(120px)',
            }}
          />

          {/* Interactive VisionOS Specular Cursor Glow */}
          {!isTouchDevice && (
            <div
              className="absolute w-[500px] h-[500px] rounded-full opacity-20 transition-transform duration-75 ease-out will-change-transform pointer-events-none"
              style={{
                transform: `translate3d(${mousePos.x - 250}px, ${mousePos.y - 250}px, 0)`,
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(255, 255, 255, 0.12) 40%, transparent 70%)',
                filter: 'blur(75px)',
              }}
            />
          )}
        </>
      )}

      {/* ── 🌌 Theme: Vibe (Cyber Sunset Nebula Aura) ── */}
      {isVibe && (
        <>
          {/* Cyber Sunset Violet Aurora (Top-Left) */}
          <div
            className="absolute -top-[18%] -left-[15%] w-[520px] sm:w-[900px] h-[520px] sm:h-[900px] rounded-full opacity-40 animate-blob-1 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.42) 0%, rgba(126, 34, 206, 0.15) 50%, transparent 75%)',
              filter: 'blur(100px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {/* Radiant Neon Rose Pink Aura (Top-Right) */}
          <div
            className="absolute -top-[12%] -right-[12%] w-[480px] sm:w-[820px] h-[480px] sm:h-[820px] rounded-full opacity-35 animate-blob-2 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.38) 0%, rgba(219, 39, 119, 0.12) 50%, transparent 75%)',
              filter: 'blur(100px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />

          {/* Deep Indigo Twilight Core (Bottom-Center) */}
          <div
            className="absolute -bottom-[22%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[1050px] h-[500px] sm:h-[800px] rounded-full opacity-30 will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.38) 0%, rgba(67, 56, 202, 0.15) 55%, transparent 75%)',
              filter: 'blur(120px)',
            }}
          />

          {/* Interactive Neon Cursor Orb */}
          {!isTouchDevice && (
            <div
              className="absolute w-[450px] h-[450px] rounded-full opacity-25 transition-transform duration-75 ease-out will-change-transform pointer-events-none"
              style={{
                transform: `translate3d(${mousePos.x - 225}px, ${mousePos.y - 225}px, 0)`,
                background: 'radial-gradient(circle, rgba(217, 70, 239, 0.5) 0%, rgba(168, 85, 247, 0.2) 45%, transparent 70%)',
                filter: 'blur(70px)',
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
      {!isDark && !isSpatial && !isVibe && (
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
