'use client';

import React, { useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface Floating3DChickenProps {
  size?: number;
  interactive?: boolean;
  className?: string;
}

export default function Floating3DChicken({
  size = 120,
  interactive = true,
  className = '',
}: Floating3DChickenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth, relaxed spring response with higher mass and damping
  const x = useSpring(0, { stiffness: 100, damping: 25, mass: 1.2 });
  const y = useSpring(0, { stiffness: 100, damping: 25, mass: 1.2 });

  const rotateX = useTransform(y, [-0.5, 0.5], [22, -22]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-22, 22]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 900, width: size, height: size }}
      className={`relative flex items-center justify-center select-none cursor-pointer ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [-8, 8, -8],
          rotateZ: [-3, 3, -3],
        }}
        transition={{
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.14, transition: { duration: 0.5 } }}
        whileTap={{ scale: 0.95 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Holographic Glowing 3D Orbit Ring 1 - Relaxed 28s orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-cyan-400/40 opacity-70 pointer-events-none"
          style={{
            transform: 'rotateX(60deg) translateZ(10px)',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
          }}
        />

        {/* Holographic Glowing 3D Orbit Ring 2 - Relaxed 36s orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-2 rounded-full border border-violet-500/30 opacity-60 pointer-events-none"
          style={{
            transform: 'rotateY(60deg) translateZ(-10px)',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.25)',
          }}
        />

        {/* 3D Depth Shadow with subtle breathing animation */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-3 w-3/4 h-3 bg-black/40 rounded-full blur-md"
          style={{ transform: 'translateZ(-30px)' }}
        />

        {/* High-Resolution Emblem */}
        <motion.div
          style={{ transform: 'translateZ(35px)' }}
          className="relative z-20 w-full h-full rounded-3xl p-1 overflow-hidden"
        >
          <img
            src="/logo.png"
            alt="ChickFarm Hologram"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
