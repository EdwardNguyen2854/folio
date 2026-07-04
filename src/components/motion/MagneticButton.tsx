import { useMotionValue, motion, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export function MagneticButton({ children, className, onClick, disabled }: MagneticButtonProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    if (dist > 120) {
      x.set(0);
      y.set(0);
      return;
    }
    const strength = 8;
    x.set((event.clientX - centerX) / strength);
    y.set((event.clientY - centerY) / strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={prefersReduced ? undefined : { x, y }}
      onMouseMove={prefersReduced ? undefined : handleMouseMove}
      onMouseLeave={prefersReduced ? undefined : handleMouseLeave}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      whileHover={prefersReduced ? undefined : { scale: 1.02 }}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
