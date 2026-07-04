import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

export function StaggerReveal({ children, className, staggerDelay = 0.05 }: StaggerRevealProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? undefined : 'hidden'}
      animate="visible"
      variants={prefersReduced ? undefined : {
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function staggerItemVariants(direction: 'up' | 'down' | 'left' | 'right' = 'up') {
  const offsets = { up: { y: 16 }, down: { y: -16 }, left: { x: 16 }, right: { x: -16 } };
  return {
    hidden: { opacity: 0, ...offsets[direction] },
    visible: { opacity: 1, ...offsets[direction], x: 0, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };
}
