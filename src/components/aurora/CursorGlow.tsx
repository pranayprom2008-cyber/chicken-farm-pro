"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';

export default function CursorGlow() {
  const theme = useFarmStore((state) => state.theme);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    }
  }, []);

  useEffect(() => {
    if (theme !== 'obsidian' || isTouch) return;

    let rafId: number;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updateCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [theme, isTouch]);

  if (theme !== 'obsidian' || isTouch) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-[300px] h-[300px] -mt-[150px] -ml-[150px] rounded-full pointer-events-none z-0 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)',
        willChange: 'transform'
      }}
    />
  );
}
