'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

export default function TiltCard({
  children,
  className = '',
  maxTilt = 4.5,
  glare = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
    }
  }, []);

  const x = useSpring(0, { stiffness: 220, damping: 28, mass: 0.8 });
  const y = useSpring(0, { stiffness: 220, damping: 28, mass: 0.8 });

  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const glareX = useTransform(x, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(y, [-0.5, 0.5], [10, 90]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative"
      onMouseEnter={() => !isTouch && setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        style={
          isTouch
            ? {}
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
        }
        whileHover={isTouch ? {} : { y: -3 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className={`relative ${className}`}
      >
        {/* Child Content */}
        <div style={isTouch ? {} : { transform: 'translateZ(12px)' }} className="relative z-10">
          {children}
        </div>

        {/* 3D Specular Dynamic Glass Refraction Glare */}
        {glare && isHovered && !isTouch && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.28) 0%, transparent 65%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
