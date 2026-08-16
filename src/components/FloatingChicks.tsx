'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

interface ChickEntity {
  id: number;
  startX: number; // in vw %
  startY: number; // in vh %
  size: number;
  duration: number;
  delay: number;
  scale: number;
  variant: 'golden' | 'amber' | 'emerald' | 'fluffy';
}

const CHICKS: ChickEntity[] = [
  { id: 1, startX: 8, startY: 22, size: 44, duration: 14, delay: 0, scale: 1, variant: 'golden' },
  { id: 2, startX: 88, startY: 16, size: 38, duration: 18, delay: 2, scale: 0.9, variant: 'amber' },
  { id: 3, startX: 14, startY: 72, size: 52, duration: 16, delay: 1, scale: 1.1, variant: 'golden' },
  { id: 4, startX: 82, startY: 68, size: 42, duration: 20, delay: 3, scale: 0.95, variant: 'fluffy' },
  { id: 5, startX: 48, startY: 86, size: 36, duration: 22, delay: 4, scale: 0.85, variant: 'amber' },
];

export default function FloatingChicks() {
  const [clickedChickId, setClickedChickId] = useState<number | null>(null);
  const [chirpText, setChirpText] = useState<{ id: number; text: string; x: number; y: number } | null>(null);

  const chirps = ['Peeep! 🐥', 'Cheep cheep! ✨', 'Cluck! 🌿', 'Peep peep! 💛', 'Happy chick! 🎉', 'Bio-secure! 🛡️'];

  const handleChickClick = (e: React.MouseEvent, id: number) => {
    setClickedChickId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const randomChirp = chirps[Math.floor(Math.random() * chirps.length)];
    setChirpText({ id, text: randomChirp, x: rect.left, y: rect.top - 30 });

    setTimeout(() => {
      setClickedChickId(null);
      setChirpText(null);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[15] overflow-hidden">
      {/* Floating Feather Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`feather-${i}`}
          className="absolute w-2 h-3 rounded-full bg-amber-300/20 backdrop-blur-xs blur-[0.5px]"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -60, -120, -180, 0],
            x: [0, (i % 2 === 0 ? 30 : -30), 0],
            rotate: [0, 45, 180, 360],
            opacity: [0.15, 0.4, 0.2, 0],
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}

      {/* Floating Interactive Chicks */}
      {CHICKS.map((chick) => {
        const isClicked = clickedChickId === chick.id;

        return (
          <motion.div
            key={chick.id}
            className="absolute pointer-events-auto cursor-pointer select-none group"
            style={{
              left: `${chick.startX}%`,
              top: `${chick.startY}%`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.65, 0.95, 0.75, 0.9, 0.65],
              y: [0, -28, 14, -20, 0],
              x: [0, 18, -14, 12, 0],
              rotate: [0, 6, -5, 4, 0],
              scale: isClicked ? 1.35 : chick.scale,
            }}
            transition={{
              duration: chick.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: chick.delay,
            }}
            onClick={(e) => handleChickClick(e, chick.id)}
            whileHover={{ scale: 1.25, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Ambient Glow Aura */}
            <div
              className={`absolute -inset-2.5 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300 ${
                chick.variant === 'amber'
                  ? 'bg-amber-400/40'
                  : chick.variant === 'fluffy'
                  ? 'bg-yellow-300/40'
                  : 'bg-emerald-400/30'
              }`}
            />

            {/* Chick Body Graphic (Organic SVG Illustration) */}
            <div className="relative w-11 h-11 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)]">
              <svg viewBox="0 0 100 100" className="w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                <defs>
                  {/* Radial Gradient for 3D Soft Chick Texture */}
                  <radialGradient id={`chickGrad-${chick.id}`} cx="38%" cy="32%" r="65%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="55%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#EAB308" />
                  </radialGradient>

                  {/* Belly Soft Highlight */}
                  <radialGradient id={`bellyGrad-${chick.id}`} cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FDE047" stopOpacity="0.3" />
                  </radialGradient>

                  {/* Wing Gradient */}
                  <linearGradient id={`wingGrad-${chick.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#CA8A04" />
                  </linearGradient>
                </defs>

                {/* Little Feet */}
                <ellipse cx="40" cy="86" rx="7" ry="3.5" fill="#EA580C" />
                <ellipse cx="60" cy="86" rx="7" ry="3.5" fill="#EA580C" />

                {/* Main Body */}
                <circle cx="50" cy="54" r="32" fill={`url(#chickGrad-${chick.id})`} />

                {/* Belly Highlight */}
                <circle cx="50" cy="58" r="21" fill={`url(#bellyGrad-${chick.id})`} />

                {/* Cute Head Tuft / Crest */}
                <path
                  d="M 50 22 C 47 12, 53 10, 52 18 C 55 12, 60 13, 56 22 Z"
                  fill="#FBBF24"
                />

                {/* Left Cute Eye */}
                <circle cx="41" cy="46" r="4.2" fill="#1E293B" />
                <circle cx="39.5" cy="44.5" r="1.5" fill="#FFFFFF" />

                {/* Right Cute Eye */}
                <circle cx="59" cy="46" r="4.2" fill="#1E293B" />
                <circle cx="57.5" cy="44.5" r="1.5" fill="#FFFFFF" />

                {/* Rosy Cheeks */}
                <circle cx="33" cy="54" r="4" fill="#F43F5E" opacity="0.45" />
                <circle cx="67" cy="54" r="4" fill="#F43F5E" opacity="0.45" />

                {/* Cute Orange Beak */}
                <polygon points="50,49 43,56 57,56" fill="#EA580C" />
                <polygon points="50,59 45,56 55,56" fill="#C2410C" />

                {/* Cute Tiny Wings with Flap Motion */}
                <motion.path
                  d="M 20 52 C 14 56, 15 68, 26 62 Z"
                  fill={`url(#wingGrad-${chick.id})`}
                  animate={{
                    rotate: isClicked ? [0, -35, 15, -30, 0] : [0, -10, 0],
                  }}
                  transition={{
                    duration: isClicked ? 0.4 : 2,
                    repeat: isClicked ? 3 : Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ originX: '26px', originY: '56px' }}
                />
                <motion.path
                  d="M 80 52 C 86 56, 85 68, 74 62 Z"
                  fill={`url(#wingGrad-${chick.id})`}
                  animate={{
                    rotate: isClicked ? [0, 35, -15, 30, 0] : [0, 10, 0],
                  }}
                  transition={{
                    duration: isClicked ? 0.4 : 2,
                    repeat: isClicked ? 3 : Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ originX: '74px', originY: '56px' }}
                />
              </svg>

              {/* Sparkle badge on hover */}
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 drop-shadow-sm animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Interactive Speech / Chirp Bubble */}
      <AnimatePresence>
        {chirpText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none z-[30] px-3.5 py-1.5 rounded-2xl bg-neutral-900/90 text-amber-300 border border-amber-400/40 backdrop-blur-md text-xs font-black shadow-xl shadow-amber-500/10 flex items-center gap-1.5"
            style={{ left: chirpText.x, top: chirpText.y }}
          >
            <span>{chirpText.text}</span>
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
