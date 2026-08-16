'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  // Relaxed spring for satisfying rolling number rollout
  const spring = useSpring(value, { mass: 1.2, stiffness: 45, damping: 14 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(Number(latest.toFixed(decimals)));
    });
  }, [spring, decimals]);

  return (
    <motion.span
      className={`inline-block tabular-nums ${className}`}
      key={value}
      initial={{ scale: 0.96, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {prefix}
      {displayValue.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </motion.span>
  );
}
