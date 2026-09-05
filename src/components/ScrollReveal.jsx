"use client";
import { motion } from 'framer-motion';

// Direction → initial offset
const OFFSETS = {
  up:    { y: 36, x: 0 },
  down:  { y: -36, x: 0 },
  left:  { y: 0, x: 40 },
  right: { y: 0, x: -40 },
  fade:  { y: 0, x: 0 },
};

/**
 * MotionReveal — Framer Motion whileInView reveal.
 * Drop-in replacement for the old IntersectionObserver ScrollReveal.
 * 
 * Props:
 *   direction: 'up' | 'down' | 'left' | 'right' | 'fade'
 *   delay: seconds (default 0)
 *   once: bool (default true — animate only first time)
 *   className: pass-through
 */
export default function MotionReveal({
  children,
  direction = 'up',
  delay = 0,
  once = true,
  className = '',
}) {
  const offset = OFFSETS[direction] ?? OFFSETS.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration: 0.72,
        delay,
        ease: [0.16, 1, 0.3, 1], // expo out — fast settle, no bounce
      }}
    >
      {children}
    </motion.div>
  );
}
