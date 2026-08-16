'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          y: 16,
          scale: 0.99,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1], // Smooth cinematic curve
          },
        }}
        exit={{
          opacity: 0,
          y: -10,
          scale: 0.99,
          transition: {
            duration: 0.35,
            ease: [0.7, 0, 0.84, 0],
          },
        }}
        className="w-full will-change-[transform,opacity]"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
